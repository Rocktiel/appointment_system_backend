import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PackageRequestDto } from './dto/request/PackageRequest.dto';
import {
  PackageListResponseDto,
  PackageResponseDto,
} from './dto/response/PackageResponse.dto';
import { BaseResponse } from 'src/_base/response/base.response';
import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';
import { RolesGuard } from 'src/_common/guard/roles.guard';
import { UserTypes } from 'src/_common/enums/UserTypes.enums';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
  ) {}

  @Post('create')
  @UseGuards(RolesGuard)
  @SetMetadata('roles', [UserTypes.ADMIN])
  async createPackage(
    @Body() body: PackageRequestDto,
  ): Promise<PackageResponseDto> {
    try {
      const result = await this.adminService.createSubscriptionPlan(body);
      return new BaseResponse(result, true, ResponseMessages.SUCCESS);
    } catch (error) {
      throw error;
    }
  }

  @Get('getPackages')
  async getPackages(): Promise<PackageListResponseDto> {
    const result = await this.adminService.getSubscriptionPlans();
    return new BaseResponse(result, true, ResponseMessages.SUCCESS);
  }
}
