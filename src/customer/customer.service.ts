import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentStatus } from 'src/_common/enums/AppointmentStatus.enum';
import {
  Appointment,
  Business,
  Day,
  TimeSlot,
  User,
} from 'src/_common/typeorm';
import { Raw, Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/request/CreateAppointment.dto';
import { DetailedTimeSlotDto } from './dto/request/DetailedTimeSlot.dto';
import { TwilioService } from 'src/sms/twilio.service';
import { parseISO, getDay } from 'date-fns';
@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(Day)
    private dayRepository: Repository<Day>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly twilioService: TwilioService,
  ) {}

  async getBusinessBySlug(slug: string): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { slug } });
    if (!business) {
      throw new NotFoundException(`Business with slug "${slug}" not found`);
    }
    return business;
  }

  async getDetailedTimeSlots(
    businessId: number,
    dateString: string,
  ): Promise<DetailedTimeSlotDto[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    // 1. İstenen tarihin haftanın hangi günü olduğunu bul
    const parsedDate = parseISO(dateString); // "YYYY-MM-DD" stringini Date objesine dönüştürür
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Please use YYYY-MM-DD.',
      );
    }

    const dayOfWeekIndex = getDay(parsedDate); // 0 (Sun) -> 6 (Sat)

    let dayId: number;
    if (dayOfWeekIndex === 0) {
      // Pazar
      dayId = 7;
    } else {
      // Pazartesi-Cumartesi
      dayId = dayOfWeekIndex;
    }

    // 2. İşletmenin o güne ait tüm genel zaman dilimi şablonlarını al
    const timeSlotTemplates = await this.timeSlotRepository.find({
      where: {
        business: { id: businessId },
        day: { id: dayId }, // Haftanın doğru gününe göre filtrele
      },
      order: {
        start_time: 'ASC', // Başlangıç saatine göre sırala
      },
      relations: ['day'], // Day bilgisini de getir
    });

    if (timeSlotTemplates.length === 0) {
      return []; // O gün için tanımlı şablon yoksa boş dizi dön
    }

    // 3. Belirtilen tarihte (dateString) bu işletme için alınmış randevuları al
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        business: { id: businessId },
        date: dateString, // SADECE BU TARİHE AİT randevuları al!
        status: Raw((alias) => `${alias} IN (:...statuses)`, {
          statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        }),
        // status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]), // Eğer TypeORM sürümünüz In operatörünü destekliyorsa
      },
    });

    // 4. Genel zaman dilimlerini, alınmış randevularla karşılaştır ve kullanılabilirlik durumunu hesapla
    const detailedSlots: DetailedTimeSlotDto[] = timeSlotTemplates.map(
      (template) => {
        const isAvailableForBooking = !existingAppointments.some(
          (appointment) => {
            // Randevu başlangıcı ve bitişi ile şablonun çakışıp çakışmadığını kontrol et
            // Bir çakışma, bir randevunun şablonun tamamını veya bir kısmını kaplaması durumunda oluşur.
            // Basit çakışma kontrolü: (Başlangıç1 < Bitiş2) AND (Bitiş1 > Başlangıç2)
            const templateStart = new Date(`2000-01-01T${template.start_time}`); // Tarih önemsiz, sadece zamanı karşılaştır
            const templateEnd = new Date(`2000-01-01T${template.end_time}`);
            const appointmentStart = new Date(
              `2000-01-01T${appointment.start_time}`,
            );
            const appointmentEnd = new Date(
              `2000-01-01T${appointment.end_time}`,
            );

            return (
              templateStart < appointmentEnd && templateEnd > appointmentStart
            );
          },
        );

        return {
          id: template.id,
          start_time: template.start_time.substring(0, 5), // HH:MM formatı için
          end_time: template.end_time.substring(0, 5), // HH:MM formatı için
          isAvailableForBooking: isAvailableForBooking,
        };
      },
    );

    return detailedSlots;
  }

  async initiateAppointmentBooking(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<{
    message: string;
    verificationRequired: boolean;
    phone: string;
  }> {
    const {
      businessId,
      date,
      start_time,
      end_time,
      customerName,
      customerPhone,
      time_slot_template_id,
      note,
      serviceId,
    } = createAppointmentDto;

    // 1. İşletme ve servis var mı kontrol et
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Business not found.');
    }
    // const service = await this.serviceRepository.findOne({ where: { id: serviceId } }); // Eğer servis kontrolü yapacaksanız
    // if (!service) {
    //   throw new NotFoundException('Service not found.');
    // }

    // 2. Zaman dilimi çakışması kontrolü (aynı tarih, aynı işletme için)
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        business: { id: businessId },
        date: date,
        start_time: Raw(() => `"start_time" < :new_end_time`, {
          new_end_time: end_time,
        }),
        end_time: Raw(() => `"end_time" > :new_start_time`, {
          new_start_time: start_time,
        }),
        status: Raw(() => `"status" IN ('PENDING', 'CONFIRMED')`),
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'The selected time slot is already booked or overlaps with another appointment.',
      );
    }

    let normalizedPhoneNumber = customerPhone.startsWith('0')
      ? `+90${customerPhone.substring(1)}`
      : customerPhone;
    if (!normalizedPhoneNumber.startsWith('+')) {
      normalizedPhoneNumber = `+${normalizedPhoneNumber}`;
    }

    try {
      // smsStatus doğrudan bir string döndürüyor: "pending", "approved", "failed"
      const smsStatus: string = await this.twilioService.sendVerificationCode(
        normalizedPhoneNumber,
      );
      // Bu kontrolü string değerine göre yapıyoruz:
      if (smsStatus !== 'pending') {
        throw new InternalServerErrorException(
          'Doğrulama kodu gönderilirken bir sorun oluştu. Durum: ' + smsStatus,
        );
      }
      // console.log(
      //   `SMS Sent to ${normalizedPhoneNumber} via Twilio. Status: ${smsStatus}`,
      // );
    } catch (smsError) {
      console.error('Twilio SMS gönderme hatası:', smsError);
      throw new InternalServerErrorException(
        'Doğrulama kodu gönderilirken bir hata oluştu.',
      );
    }

    return {
      message: 'Telefon numaranıza doğrulama kodu gönderildi.',
      verificationRequired: true,
      phone: normalizedPhoneNumber,
    };
  }

  async verifyPhoneNumber(phone: string, code: string): Promise<boolean> {
    try {
      // verificationResult doğrudan bir string döndürüyor: "approved", "pending", "failed"
      const verificationResult: string = await this.twilioService.verifyCode(
        phone,
        code,
      );
      // Bu kontrolü string değerine göre yapıyoruz:
      if (verificationResult === 'approved') {
        return true;
      } else {
        throw new BadRequestException(
          'Geçersiz doğrulama kodu veya süresi dolmuş.',
        );
      }
    } catch (error) {
      console.error('Twilio SMS doğrulama hatası:', error);
      throw new BadRequestException(
        'Doğrulama kodunun süresi dolmuş veya geçersiz.',
      );
    }
  }

  async finalizeAppointment(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const {
      businessId,
      date,
      start_time,
      end_time,
      customerName,
      customerPhone,
      note,
      time_slot_template_id,
      serviceId,
    } = createAppointmentDto;

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Business not found.');
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayMap = [
      'Pazar',
      'Pazartesi',
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
    ];
    const dayName = dayMap[dayOfWeek];
    const dayEntity = await this.dayRepository.findOne({
      where: { day_name: dayName },
    });

    if (!dayEntity) {
      throw new BadRequestException('Invalid day for appointment.');
    }

    const existingConflictingAppointment =
      await this.appointmentRepository.findOne({
        where: {
          business: { id: businessId },
          date: date,
          start_time,
          end_time,
          status: AppointmentStatus.PENDING,
        },
      });

    if (existingConflictingAppointment) {
      throw new BadRequestException(
        'Bu zaman dilimi az önce alınmış. Lütfen başka bir zaman seçin.',
      );
    }

    const newAppointment = this.appointmentRepository.create({
      business_id: businessId,
      date,
      start_time,
      end_time,
      customer_name: customerName,
      customer_phone: customerPhone,
      note,
      day: dayEntity,
      day_id: dayEntity.id,
      status: AppointmentStatus.PENDING,
      service_id: serviceId,
      time_slot_template_id: time_slot_template_id,
    });

    return this.appointmentRepository.save(newAppointment);
  }

  async getBusinessByLocation(
    city: string,
    county: string,
  ): Promise<Business[]> {
    const businesses = await this.businessRepository.find({
      where: {
        city: Raw((alias) => `${alias} ILIKE :city`, { city: `%${city}%` }),
        county: Raw((alias) => `${alias} ILIKE :county`, {
          county: `%${county}%`,
        }),
      },
      select: [
        'id',
        'businessName',
        'city',
        'county',
        'slug',
        'businessPhone',
        'businessAddress',
      ], // Sadece bu alanları seç
    });

    if (businesses.length === 0) {
      throw new NotFoundException('Seçtiğiniz konumda işletme bulunamadı.');
    }

    return businesses;
  }
}
