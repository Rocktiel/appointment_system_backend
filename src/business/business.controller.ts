import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BaseResponse } from 'src/_base/response/base.response';
import { BusinessRequestDto } from './dto/request/BusinessRequest.dto';
import { BusinessResponseDto } from './dto/response/BusinessResponse.dto';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from 'src/_common/guard/jwt-auth.guard';
import { TimeSlotRequestDto } from './dto/request/TimeSlotRequest.dto';
import { SubscribePackageDto } from './dto/request/SubscribePackageRequest.dto';
import { JwtPayload } from 'src/_common/payloads/jwt.payload';
import { Request as ExpressRequest } from 'express';
import { CreateServiceDto } from './dto/request/CreateService.dto';
import { Service } from 'src/_common/typeorm';
import { AppointmentsRequestDto } from './dto/request/AppointmentsRequest.dto';
import { plainToInstance } from 'class-transformer';
import { AppointmentResponseDto } from './dto/response/AppointmentResponse.dto';
interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @Body() dto: BusinessRequestDto,
    @Req() req,
  ): Promise<BusinessResponseDto> {
    const business = await this.businessService.createBusiness(
      dto,
      req.user.id,
    );
    return new BaseResponse(business, true, 'İşletme başarıyla oluşturuldu');
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-add-permission')
  @HttpCode(HttpStatus.OK)
  async checkBusinessAddPermission(
    @Req() req: any, // 'any' yerine daha spesifik bir Request tipi kullanabilirsiniz
  ): Promise<{ canAddBusiness: boolean; message?: string }> {
    // JWT guard'ı geçtiği için request.user objesinin var olacağını varsayıyoruz
    // request.user objesinin içinde userId'nizin hangi isimde olduğuna dikkat edin (örneğin 'id' veya 'sub')
    const userId = req.user.id; // VEYA req.user.sub (JWT payload'ında 'sub' olarak geliyorsa)

    try {
      await this.businessService.businessCount(userId);
      return {
        canAddBusiness: true,
        message: 'Yeni işletme ekleyebilirsiniz.',
      };
    } catch (error) {
      console.warn('İşletme ekleme izni kontrolünde hata:', error.message);
      return { canAddBusiness: false, message: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateBusiness(
    @Param('id', ParseIntPipe) businessId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: Partial<BusinessRequestDto>, // Sadece gönderilen alanları güncellemek için Partial
  ) {
    // İşletmenin gerçekten bu kullanıcıya ait olup olmadığını kontrol etmeniz GEREKİR!
    const updatedBusiness = await this.businessService.updateBusiness(
      businessId,
      dto,
      req.user.id,
    );
    return new BaseResponse(
      updatedBusiness,
      true,
      'İşletme bilgileri başarıyla güncellendi.',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-package') // Örneğin: /business/my-package
  @HttpCode(HttpStatus.OK)
  async getMyPackage(@Req() req: AuthenticatedRequest) {
    const userPayload = req.user as JwtPayload;

    if (!userPayload || !userPayload.id) {
      throw new BadRequestException('Kullanıcı bilgisi eksik veya geçersiz.');
    }

    const userPackage = await this.businessService.getUserPackage(
      userPayload.id,
    );

    return {
      success: true,
      data: userPackage,
      message: userPackage ? 'Aktif paket bulundu.' : 'Aktif paket bulunamadı.',
    };
  }

  @Get('packages') // Örneğin: /business/packages
  @HttpCode(HttpStatus.OK)
  async getAvailablePackages() {
    const packages = await this.businessService.getActiveSubscriptionPlans();
    return {
      success: true,
      data: packages,
      message: 'Mevcut paketler başarıyla getirildi.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('time-slot/create')
  async createTimeSlot(@Body() dto: TimeSlotRequestDto) {
    const result = await this.businessService.createTimeSlot(dto);
    return {
      data: result,
      success: true,
      message: 'Zaman dilimi başarıyla oluşturuldu.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':businessId/time-slots/:slotId')
  async updateTimeSlot(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: Partial<TimeSlotRequestDto>, // Update için
  ) {
    const updatedSlot = await this.businessService.updateTimeSlot(
      businessId,
      slotId,
      req.user.id,
      dto,
    );
    return new BaseResponse(
      updatedSlot,
      true,
      'Zaman dilimi başarıyla güncellendi.',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/time-slots/delete/:slotId')
  async deleteTimeSlot(
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.businessService.deleteTimeSlot(slotId, req.user.id);
    return new BaseResponse(null, true, 'Zaman dilimi başarıyla silindi.');
  }

  @Get(':id/time-slots')
  async getBusinessTimeSlots(@Param('id', ParseIntPipe) businessId: number) {
    const result =
      await this.businessService.getTimeSlotsForBusiness(businessId);
    return {
      data: result,
      success: true,
    };
  }
  @Get(':id/time-slots/:dayId')
  async getBusinessTimeSlotsByDay(
    @Param('id', ParseIntPipe) businessId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
  ) {
    const result = await this.businessService.getTimeSlotsByDay(
      businessId,
      dayId,
    );
    return {
      data: result,
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribeToPackage(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubscribePackageDto,
  ) {
    const userPayload = req.user as JwtPayload;

    if (!userPayload || !userPayload.id) {
      throw new BadRequestException('Kullanıcı bilgisi eksik veya geçersiz.');
    }

    const result = await this.businessService.subscribeToPackage(
      userPayload.id,
      dto,
    );

    return {
      success: true,
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':businessId/services')
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Param('businessId') businessId: string,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const id = parseInt(businessId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid business ID.');
    }
    return this.businessService.createService(id, createServiceDto);
  }

  @Get(':businessId/services')
  @HttpCode(HttpStatus.OK)
  async getServicesByBusinessId(
    @Param('businessId') businessId: string,
  ): Promise<Service[]> {
    const id = parseInt(businessId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid business ID.');
    }
    return this.businessService.getServicesByBusinessId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':businessId/services/:serviceId')
  @HttpCode(HttpStatus.OK)
  async updateService(
    @Param('businessId') businessId: string,
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: Partial<CreateServiceDto>,
  ): Promise<Service> {
    const bId = parseInt(businessId, 10);
    const sId = parseInt(serviceId, 10);
    if (isNaN(bId) || isNaN(sId)) {
      throw new BadRequestException('Invalid IDs.');
    }
    return this.businessService.updateService(bId, sId, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':businessId/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteService(
    @Param('businessId') businessId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<void> {
    const bId = parseInt(businessId, 10);
    const sId = parseInt(serviceId, 10);
    if (isNaN(bId) || isNaN(sId)) {
      throw new BadRequestException('Invalid IDs.');
    }
    await this.businessService.deleteService(bId, sId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-businesses')
  async getMyBusinesses(@Req() req: AuthenticatedRequest) {
    const user = req.user as any;
    return this.businessService.getAllBusinessesByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/appointments')
  async getAppointments(@Query() dto: AppointmentsRequestDto) {
    const appointments = await this.businessService.getAppointments(dto);
    return plainToInstance(AppointmentResponseDto, appointments, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/appointment')
  async getAppointmentByTimeSlotId(@Query() dto: AppointmentsRequestDto) {
    const appointments =
      await this.businessService.getAppointmentByTimeSlotId(dto);

    return plainToInstance(AppointmentResponseDto, appointments, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/appointments/:id')
  async getAppointment(@Param('id') id: number) {
    const appointment = await this.businessService.getAppointment(id);
    return plainToInstance(AppointmentResponseDto, appointment, {
      excludeExtraneousValues: true,
    });
  }

  @Get('business/:businessId/detailed-slots-range')
  async getWeeklySlots(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.businessService.getDetailedTimeSlotsInRange(
      businessId,
      start,
      end,
    );
  }
}
