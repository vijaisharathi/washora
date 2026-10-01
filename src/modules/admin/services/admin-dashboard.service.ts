import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async getMetrics(orgId: string) {
    return this.adminRepo.getDashboardMetrics(orgId);
  }
}
