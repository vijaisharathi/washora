import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import { GlobalSearchQueryDto } from '../dto/operations-admin.dto';

@Injectable()
export class AdminSearchService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async search(orgId: string, query: GlobalSearchQueryDto) {
    const rawResults = await this.adminRepo.globalSearch(orgId, query.q);

    // If entityType filter is provided, return only that entity
    if (query.entityType) {
      const entityKeyMap: Record<string, keyof typeof rawResults> = {
        Customer: 'customers',
        Provider: 'providers',
        DeliveryPartner: 'deliveryPartners',
        Booking: 'bookings',
        Service: 'services',
        Payment: 'payments',
        SupportTicket: 'supportTickets',
        Dispute: 'disputes',
        Review: 'reviews',
      };

      const key = entityKeyMap[query.entityType];
      if (key && rawResults[key]) {
        return {
          [key]: rawResults[key],
          totalResults: rawResults[key].length,
        };
      }
    }

    const totalResults =
      rawResults.customers.length +
      rawResults.providers.length +
      rawResults.deliveryPartners.length +
      rawResults.bookings.length +
      rawResults.services.length +
      rawResults.payments.length +
      rawResults.supportTickets.length +
      rawResults.disputes.length +
      rawResults.reviews.length;

    return {
      ...rawResults,
      totalResults,
    };
  }
}
