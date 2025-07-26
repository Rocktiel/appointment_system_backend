import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Business, SubscriptionPlan } from 'src/_common/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/_common/guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, Business]),
    JwtModule.register({}),
  ],
})
export class AdminModule {}
