import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  Business,
  Day,
  Service,
  SubscriptionPlan,
  TimeSlot,
  User,
} from 'src/_common/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotRequestDto } from './dto/request/TimeSlotRequest.dto';
import { BusinessRequestDto } from './dto/request/BusinessRequest.dto';
import { SubscribePackageDto } from './dto/request/SubscribePackageRequest.dto';
import { CreateServiceDto } from './dto/request/CreateService.dto';
import { AppointmentsRequestDto } from './dto/request/AppointmentsRequest.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepo: Repository<TimeSlot>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SubscriptionPlan)
    private readonly packageRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Day) private readonly dayRepo: Repository<Day>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async createBusiness(
    dto: BusinessRequestDto,
    userId: number,
  ): Promise<Business> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['package', 'businesses'],
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (!user.package)
      throw new BadRequestException('Kullanıcının aktif bir paketi yok');

    const currentCount = await this.businessRepository.count({
      where: { user: { id: user.id } },
    });

    if (currentCount >= user.package.maxBusinesses) {
      throw new ForbiddenException(
        'İşletme ekleme sınırına ulaştınız. Daha üst bir paket alınız.',
      );
    }
    const slug = this.generateSlug(dto.businessName);
    const newBusiness = this.businessRepository.create({ ...dto, user, slug });
    return await this.businessRepository.save(newBusiness);
  }
  async businessCount(userId: number): Promise<number> {
    const currentCount = await this.businessRepository.count({
      where: { user: { id: userId } },
    });
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['package', 'businesses'],
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (!user.package)
      throw new BadRequestException('Kullanıcının aktif bir paketi yok');
    if (currentCount >= user.package.maxBusinesses) {
      throw new ForbiddenException(
        'İşletme ekleme sınırına ulaştınız. Daha üst bir paket alınız.',
      );
    }
    return 1;
  }
  async updateBusiness(
    businessId: number,
    dto: Partial<BusinessRequestDto>,
    userId: number,
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'], // Kullanıcı bilgisini de çekiyoruz
    });

    if (!business) {
      throw new NotFoundException('İşletme bulunamadı.');
    }
    if (business.user.id !== userId) {
      throw new ForbiddenException('Bu işletmeyi güncelleme yetkiniz yok.');
    }

    Object.assign(business, dto); // Güncellenen alanları ata
    return await this.businessRepository.save(business);
  }
  async getUserPackage(userId: number): Promise<SubscriptionPlan | null> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['package'], // İlişkili paketi de getir
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }
    return user.package || null; // Paketi döndür, yoksa null
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await this.packageRepo.find({
      where: { isActive: true }, // Sadece aktif paketleri getir
      order: { price: 'ASC' }, // Fiyata göre sıralayabiliriz
    });
  }

  async getBusinessById(id: number, userId: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('İşletme bulunamadı');
    }

    if (business.user.id !== userId) {
      throw new ForbiddenException('Bu işletmeye erişim izniniz yok');
    }

    return business;
  }
  async getBusinessByBusinessId(id: number): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found.`);
    }
    return business;
  }

  async deleteBusiness(id: number, userId: number): Promise<void> {
    const business = await this.getBusinessById(id, userId);
    await this.businessRepository.remove(business);
  }

  async getAllBusinessesByUser(userId: number): Promise<Business[]> {
    return await this.businessRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
  async createTimeSlot(dto: TimeSlotRequestDto): Promise<TimeSlot> {
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
    });
    if (!business) throw new NotFoundException('İşletme bulunamadı');

    const day = await this.dayRepo.findOne({ where: { id: dto.dayId } });
    if (!day) throw new NotFoundException('Gün bulunamadı');

    const newSlot = this.timeSlotRepo.create({
      business_id: dto.businessId,
      business: business,
      day: day,
      start_time: dto.startTime,
      end_time: dto.endTime,
    });

    return await this.timeSlotRepo.save(newSlot);
  }

  async updateTimeSlot(
    businessId: number,
    slotId: number,
    userId: number,
    dto: Partial<TimeSlotRequestDto>,
  ): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotRepo.findOne({
      where: { id: slotId, business_id: businessId },
      relations: ['business', 'business.user'],
    });

    if (!timeSlot) throw new NotFoundException('Zaman dilimi bulunamadı.');
    if (timeSlot.business.user.id !== userId)
      throw new ForbiddenException(
        'Bu zaman dilimini güncelleme yetkiniz yok.',
      );

    Object.assign(timeSlot, dto);
    return await this.timeSlotRepo.save(timeSlot);
  }

  async deleteTimeSlot(slotId: number, userId: number): Promise<void> {
    const timeSlot = await this.timeSlotRepo.findOne({
      where: { id: slotId },
      relations: ['business', 'business.user'],
    });

    if (!timeSlot) throw new NotFoundException('Zaman dilimi bulunamadı.');
    if (timeSlot.business.user.id !== userId)
      throw new ForbiddenException('Bu zaman dilimini silme yetkiniz yok.');

    await this.timeSlotRepo.remove(timeSlot);
  }

  async getTimeSlotsForBusiness(businessId: number): Promise<TimeSlot[]> {
    return await this.timeSlotRepo.find({ where: { business_id: businessId } });
  }

  async getTimeSlotsByDay(
    businessId: number,
    dayId: number,
  ): Promise<TimeSlot[]> {
    return await this.timeSlotRepo.find({
      where: {
        business_id: businessId,
        day: { id: dayId },
      },
      order: {
        start_time: 'ASC', // Başlangıç saatine göre sırala
      },
    });
  }

  async subscribeToPackage(userId: number, dto: SubscribePackageDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['package'],
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const selectedPackage = await this.packageRepo.findOne({
      where: { id: dto.packageId, isActive: true },
    });

    if (!selectedPackage) throw new NotFoundException('Paket bulunamadı');

    // Zaten bu pakete sahip mi
    if (user.package && user.package.id === selectedPackage.id) {
      throw new BadRequestException('Zaten bu pakete abonesiniz');
    }

    // Kullanıcının sahip olduğu işletme sayısı
    const businessCount = await this.businessRepository.count({
      where: { user: { id: userId } },
    });

    // Yeni paketin sınırını aşıyor mu
    if (businessCount > selectedPackage.maxBusinesses) {
      throw new ForbiddenException(
        `Bu pakete geçilemez: mevcut işletme sayınız (${businessCount}), bu paketin sınırını (${selectedPackage.maxBusinesses}) aşıyor.`,
      );
    }

    user.package = selectedPackage;

    await this.userRepo.save(user);

    return {
      message: `Paket başarıyla değiştirildi: ${selectedPackage.name}`,
    };
  }

  async createService(
    businessId: number,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const business = await this.getBusinessByBusinessId(businessId);

    const newService = this.serviceRepository.create({
      ...createServiceDto,
      business: business,
      business_id: business.id,
    });

    try {
      return await this.serviceRepository.save(newService);
    } catch (error) {
      console.error('Hizmet oluşturulurken hata:', error);
      throw new InternalServerErrorException(
        'Hizmet oluşturulurken bir sorun oluştu.',
      );
    }
  }

  // Bir işletmenin tüm hizmetlerini listeleme
  async getServicesByBusinessId(businessId: number): Promise<Service[]> {
    const business = await this.getBusinessByBusinessId(businessId); // İşletmenin varlığını kontrol et
    return this.serviceRepository.find({
      where: { business: { id: business.id } },
      order: { name: 'ASC' }, // Hizmetleri isme göre sırala
    });
  }

  // Belirli bir hizmeti güncelleme
  async updateService(
    businessId: number,
    serviceId: number,
    updateServiceDto: Partial<CreateServiceDto>, // Sadece kısmi güncellemelere izin ver
  ): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, business: { id: businessId } },
    });

    if (!service) {
      throw new NotFoundException(
        `Hizmet ID ${serviceId} veya İşletme ID ${businessId} bulunamadı.`,
      );
    }

    Object.assign(service, updateServiceDto);

    try {
      return await this.serviceRepository.save(service);
    } catch (error) {
      console.error('Hizmet güncellenirken hata:', error);
      throw new InternalServerErrorException(
        'Hizmet güncellenirken bir sorun oluştu.',
      );
    }
  }

  // Belirli bir hizmeti silme
  async deleteService(businessId: number, serviceId: number): Promise<void> {
    const result = await this.serviceRepository.delete({
      id: serviceId,
      business: { id: businessId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Hizmet ID ${serviceId} veya İşletme ID ${businessId} bulunamadı.`,
      );
    }
  }

  async getAppointments(dto: AppointmentsRequestDto): Promise<Appointment[]> {
    const { businessId, date } = dto;
    const appointments = await this.appointmentRepository.find({
      where: {
        business_id: businessId,
        date: date,
      },
      relations: ['service'],
    });
    return appointments;
  }
  async getAppointment(id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: id },
      relations: ['service'],
    });
    return appointment;
  }

  async getAppointmentByTimeSlotId(
    dto: AppointmentsRequestDto,
  ): Promise<Appointment[]> {
    const { businessId, date, time_slot_template_id } = dto;
    const appointments = await this.appointmentRepository.find({
      where: {
        business_id: businessId,
        date: date,
        time_slot_template_id: time_slot_template_id,
      },
      relations: ['service'],
    });
    return appointments;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ğ/g, 'g')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
