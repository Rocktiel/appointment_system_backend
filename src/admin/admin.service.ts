import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business, SubscriptionPlan } from 'src/_common/typeorm';
import { Repository } from 'typeorm';
import { PackageRequestDto } from './dto/request/PackageRequest.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly adminRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async getSubscriptionPlans() {
    return await this.adminRepository.find();
  }

  async getSubscriptionPlan(id: number) {
    return await this.adminRepository.findOne({ where: { id: id } });
  }

  async createSubscriptionPlan(plan: PackageRequestDto) {
    return await this.adminRepository.save(plan);
  }

  async updateSubscriptionPlan(id: number, plan: PackageRequestDto) {
    return await this.adminRepository.update(id, plan);
  }

  async deleteSubscriptionPlan(id: number) {
    return await this.adminRepository.delete(id);
  }

  async getAllBusinesses() {
    return await this.businessRepository.find();
  }

  async getBusiness(id: number) {
    return await this.businessRepository.findOne({ where: { id: id } });
  }

  async deleteBusiness(id: number) {
    return await this.businessRepository.delete(id);
  }

  async updateBusiness(id: number, business: Business) {
    return await this.businessRepository.update(id, business);
  }

  async getAllUsers() {
    return await this.businessRepository.find();
  }

  async getUserBusinesses(userId: number) {
    return await this.businessRepository.find({
      where: { user: { id: userId } },
      relations: ['user'], // Eğer user bilgisi de dönecekse
    });
  }
}
