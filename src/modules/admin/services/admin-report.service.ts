import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import { ReportQueryDto } from '../dto/operations-admin.dto';

@Injectable()
export class AdminReportService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async getBookingReport(orgId: string, query: ReportQueryDto) {
    return this.adminRepo.getBookingReport(
      orgId,
      query.dateFrom,
      query.dateTo,
    );
  }

  async getRevenueReport(orgId: string, query: ReportQueryDto) {
    return this.adminRepo.getRevenueReport(
      orgId,
      query.dateFrom,
      query.dateTo,
    );
  }

  async getProviderPerformanceReport(orgId: string) {
    return this.adminRepo.getProviderPerformanceReport(orgId);
  }

  async getCustomerAcquisitionReport(orgId: string, query: ReportQueryDto) {
    return this.adminRepo.getCustomerAcquisitionReport(
      orgId,
      query.dateFrom,
      query.dateTo,
    );
  }
}
