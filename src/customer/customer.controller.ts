// src/modules/customer/customer.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Appointment, Business } from 'src/_common/typeorm';
import { DetailedTimeSlotDto } from './dto/request/DetailedTimeSlot.dto';
import { CreateAppointmentDto } from './dto/request/CreateAppointment.dto';
import { VerifyPhoneDto } from './dto/request/VerifyPhone.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('business/:slug')
  @HttpCode(HttpStatus.OK)
  async getBusinessBySlug(@Param('slug') slug: string): Promise<Business> {
    return this.customerService.getBusinessBySlug(slug);
  }

  // Belirli bir işletme ve tarih için müsait/dolu detaylı zaman dilimlerini getir
  @Get('business/:businessId/detailed-slots/:date')
  async getDetailedTimeSlots(
    @Param('businessId') businessId: string, // URL'den string olarak gelir
    @Param('date') date: string, // URL'den string olarak gelir
  ): Promise<DetailedTimeSlotDto[]> {
    // businessId'yi sayıya dönüştürün
    const parsedBusinessId = parseInt(businessId, 10);
    if (isNaN(parsedBusinessId)) {
      throw new BadRequestException('Invalid business ID.');
    }
    return this.customerService.getDetailedTimeSlots(parsedBusinessId, date);
  }

  // Randevu oluşturma isteğini başlat (SMS doğrulama kodu gönder)
  @Post('initiate-appointment-booking')
  @HttpCode(HttpStatus.OK) // 200 OK çünkü henüz randevu oluşturulmadı, sadece kod gönderildi
  async initiateAppointmentBooking(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<{
    message: string;
    verificationRequired: boolean;
    phone: string;
  }> {
    return this.customerService.initiateAppointmentBooking(
      createAppointmentDto,
    );
  }

  // Telefon numarasını doğrulama
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(
    @Body() verifyPhoneDto: VerifyPhoneDto,
  ): Promise<{ success: boolean; message?: string }> {
    const success = await this.customerService.verifyPhoneNumber(
      verifyPhoneDto.phone,
      verifyPhoneDto.code,
    );
    if (success) {
      return {
        success: true,
        message: 'Telefon numarası başarıyla doğrulandı.',
      };
    } else {
      throw new BadRequestException('Telefon numarası doğrulanamadı.');
    }
  }

  // Doğrulama başarılı olduktan sonra randevuyu kesinleştirme
  @Post('finalize-appointment')
  @HttpCode(HttpStatus.CREATED) // 201 Created çünkü randevu oluşturuluyor
  async finalizeAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto, // Aynı DTO'yu kullanabiliriz
  ): Promise<Appointment> {
    return this.customerService.finalizeAppointment(createAppointmentDto);
  }
}
