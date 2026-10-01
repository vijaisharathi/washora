import { Injectable } from '@nestjs/common';
import {
  AssignmentStatus,
  CatalogStatus,
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerStatus,
  ProviderApprovalStatus,
  ProviderStatus,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  AssignmentErrorCode,
  CandidateDeliveryPartnerEvaluation,
  CandidateProviderEvaluation,
  EligibilityResult,
  ParsedTimeWindow,
} from './types/assignment.types';

@Injectable()
export class AssignmentEligibilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parses time string (e.g. "08:00", "08:00 AM", "2:30 PM", "14:30") into total minutes from midnight.
   */
  parseTimeToMinutes(timeStr: string): number {
    const trimmed = timeStr.trim().toUpperCase();
    const isPm = trimmed.includes('PM');
    const isAm = trimmed.includes('AM');
    const cleanTime = trimmed.replace(/[A-Z]/g, '').trim();

    const parts = cleanTime.split(':').map((p) => parseInt(p, 10));
    let hours = parts[0] || 0;
    const minutes = parts[1] || 0;

    if (isPm && hours < 12) {
      hours += 12;
    } else if (isAm && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

  /**
   * Parses time slot string (e.g. "10:00 AM - 12:00 PM" or "10:00 - 12:00" or "10:00")
   * into a start/end window in minutes from midnight.
   */
  parseTimeSlotToWindow(slotStr?: string | null): ParsedTimeWindow {
    if (!slotStr) {
      return { startMinutes: 480, endMinutes: 1200 }; // Default 8:00 AM - 8:00 PM
    }

    if (slotStr.includes('-')) {
      const [startPart, endPart] = slotStr.split('-');
      const startMinutes = this.parseTimeToMinutes(startPart);
      const endMinutes = this.parseTimeToMinutes(endPart);
      return {
        startMinutes,
        endMinutes: endMinutes > startMinutes ? endMinutes : startMinutes + 120,
      };
    }

    const startMinutes = this.parseTimeToMinutes(slotStr);
    return { startMinutes, endMinutes: startMinutes + 120 }; // Default 2h window
  }

  /**
   * Checks if two time windows on the same calendar day overlap:
   * Interval [A_start, A_end] and [B_start, B_end] overlap if A_start < B_end && B_start < A_end.
   */
  intervalsOverlap(w1: ParsedTimeWindow, w2: ParsedTimeWindow): boolean {
    return w1.startMinutes < w2.endMinutes && w2.startMinutes < w1.endMinutes;
  }

  /**
   * Normalizes a Date object to YYYY-MM-DD string for exact calendar day comparison.
   */
  formatDateToDay(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Comprehensive Server-Side Validation of Provider Eligibility for a given Booking.
   */
  async validateProviderEligibility(
    providerIdentifier: string,
    booking: {
      id: string;
      organizationId: string;
      items: Array<{ variantId?: string | null; serviceId?: string | null }>;
      serviceId?: string;
      address?: { postalCode: string; city: string } | null;
      schedule?: { pickupDate: Date; pickupTimeSlot: string } | null;
    },
    organizationId: string,
  ): Promise<EligibilityResult> {
    // 1. Resolve Provider in Organization
    const provider = await this.prisma.provider.findFirst({
      where: {
        organizationId,
        OR: [{ id: providerIdentifier }, { publicId: providerIdentifier }],
      },
      include: {
        services: true,
        serviceAreas: true,
        availabilities: true,
        assignments: {
          where: {
            organizationId,
            status: {
              in: [
                AssignmentStatus.PENDING,
                AssignmentStatus.ASSIGNED,
                AssignmentStatus.ACCEPTED,
                AssignmentStatus.IN_TRANSIT,
                AssignmentStatus.ARRIVED,
              ],
            },
            bookingId: { not: booking.id }, // Exclude current booking if re-evaluating
          },
          include: {
            booking: {
              include: { schedule: true },
            },
          },
        },
      },
    });

    if (!provider) {
      return {
        isEligible: false,
        errorCode: AssignmentErrorCode.PROVIDER_NOT_FOUND,
        reason: `Provider '${providerIdentifier}' was not found in organization`,
      };
    }

    // 2. Account Lifecycle Status Check
    if (provider.status !== ProviderStatus.ACTIVE) {
      return {
        isEligible: false,
        errorCode: AssignmentErrorCode.PROVIDER_INACTIVE,
        reason: `Provider account is currently ${provider.status}, must be ACTIVE`,
        details: { status: provider.status },
      };
    }

    if (provider.approvalStatus !== ProviderApprovalStatus.APPROVED) {
      return {
        isEligible: false,
        errorCode: AssignmentErrorCode.PROVIDER_NOT_ELIGIBLE,
        reason: `Provider approval status is ${provider.approvalStatus}, must be APPROVED`,
        details: { approvalStatus: provider.approvalStatus },
      };
    }

    // 3. Required Service Coverage Check
    // A provider must support all services requested in the booking
    const requiredServiceIds = new Set<string>();
    if (booking.serviceId) {
      requiredServiceIds.add(booking.serviceId);
    }
    for (const item of booking.items || []) {
      if (item.serviceId) {
        requiredServiceIds.add(item.serviceId);
      }
    }

    if (requiredServiceIds.size > 0) {
      const activeProviderServiceIds = new Set(
        provider.services
          .filter((s) => s.status === CatalogStatus.ACTIVE)
          .map((s) => s.serviceId),
      );

      for (const requiredServiceId of Array.from(requiredServiceIds)) {
        if (!activeProviderServiceIds.has(requiredServiceId)) {
          return {
            isEligible: false,
            errorCode: AssignmentErrorCode.PROVIDER_SERVICE_NOT_SUPPORTED,
            reason: `Provider does not offer active service with ID '${requiredServiceId}' required by this booking`,
            details: { missingServiceId: requiredServiceId },
          };
        }
      }
    }

    // 4. Geographic Service Area Coverage Check
    if (booking.address?.postalCode) {
      const bookingPostal = booking.address.postalCode.trim();
      const servesPostal = provider.serviceAreas.some(
        (area) => area.isActive && area.postalCode.trim() === bookingPostal,
      );

      if (!servesPostal) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.PROVIDER_OUTSIDE_SERVICE_AREA,
          reason: `Provider does not service postal code '${bookingPostal}'`,
          details: { bookingPostalCode: bookingPostal },
        };
      }
    }

    // 5. Operating Availability & Capacity Check
    if (booking.schedule?.pickupDate) {
      const pickupDate = new Date(booking.schedule.pickupDate);
      const dayOfWeek = pickupDate.getUTCDay(); // 0=Sunday, 6=Saturday

      const dayAvailability = provider.availabilities.find(
        (avail) => avail.dayOfWeek === dayOfWeek,
      );

      if (!dayAvailability || !dayAvailability.isAvailable) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.PROVIDER_UNAVAILABLE,
          reason: `Provider is not available on day of week ${dayOfWeek}`,
          details: { dayOfWeek },
        };
      }

      // Check operating hours vs. booking slot
      const bookingSlotWindow = this.parseTimeSlotToWindow(
        booking.schedule.pickupTimeSlot,
      );
      const providerOpenMinutes = this.parseTimeToMinutes(
        dayAvailability.startTime,
      );
      const providerCloseMinutes = this.parseTimeToMinutes(
        dayAvailability.endTime,
      );

      if (
        bookingSlotWindow.startMinutes < providerOpenMinutes ||
        bookingSlotWindow.endMinutes > providerCloseMinutes
      ) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.PROVIDER_UNAVAILABLE,
          reason: `Booking pickup window (${booking.schedule.pickupTimeSlot}) is outside provider operating hours (${dayAvailability.startTime} - ${dayAvailability.endTime})`,
          details: {
            slot: booking.schedule.pickupTimeSlot,
            operatingHours: `${dayAvailability.startTime} - ${dayAvailability.endTime}`,
          },
        };
      }

      // Check daily capacity limit
      const targetDateStr = this.formatDateToDay(pickupDate);
      const ordersOnDate = provider.assignments.filter((asn) => {
        if (!asn.booking?.schedule?.pickupDate) return false;
        return (
          this.formatDateToDay(new Date(asn.booking.schedule.pickupDate)) ===
          targetDateStr
        );
      }).length;

      if (ordersOnDate >= dayAvailability.maxDailyOrders) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.PROVIDER_CAPACITY_EXCEEDED,
          reason: `Provider daily order limit reached for ${targetDateStr} (${ordersOnDate}/${dayAvailability.maxDailyOrders})`,
          details: {
            currentOrders: ordersOnDate,
            maxOrders: dayAvailability.maxDailyOrders,
          },
        };
      }

      // 6. Schedule Conflict Detection
      for (const activeAsn of provider.assignments) {
        if (!activeAsn.booking?.schedule?.pickupDate) continue;
        const activeDateStr = this.formatDateToDay(
          new Date(activeAsn.booking.schedule.pickupDate),
        );

        if (activeDateStr === targetDateStr) {
          const activeWindow = this.parseTimeSlotToWindow(
            activeAsn.booking.schedule.pickupTimeSlot,
          );
          if (this.intervalsOverlap(bookingSlotWindow, activeWindow)) {
            return {
              isEligible: false,
              errorCode: AssignmentErrorCode.PROVIDER_SCHEDULE_CONFLICT,
              reason: `Provider has an overlapping active assignment (${activeAsn.publicId}) on ${targetDateStr} at slot '${activeAsn.booking.schedule.pickupTimeSlot}'`,
              details: {
                conflictingAssignmentPublicId: activeAsn.publicId,
                conflictingSlot: activeAsn.booking.schedule.pickupTimeSlot,
              },
            };
          }
        }
      }
    }

    return {
      isEligible: true,
      details: {
        providerId: provider.id,
        publicId: provider.publicId,
        businessName: provider.businessName,
        fullName: provider.fullName,
      },
    };
  }

  /**
   * Comprehensive Server-Side Validation of Delivery Partner Eligibility for a given Booking.
   */
  async validateDeliveryPartnerEligibility(
    deliveryPartnerIdentifier: string,
    booking: {
      id: string;
      organizationId: string;
      address?: { postalCode: string; city: string } | null;
      schedule?: { pickupDate: Date; pickupTimeSlot: string } | null;
    },
    organizationId: string,
  ): Promise<EligibilityResult> {
    // 1. Resolve Delivery Partner in Organization
    const partner = await this.prisma.deliveryPartner.findFirst({
      where: {
        organizationId,
        OR: [
          { id: deliveryPartnerIdentifier },
          { publicId: deliveryPartnerIdentifier },
        ],
      },
      include: {
        serviceAreas: true,
        availabilities: true,
        assignments: {
          where: {
            organizationId,
            status: {
              in: [
                AssignmentStatus.PENDING,
                AssignmentStatus.ASSIGNED,
                AssignmentStatus.ACCEPTED,
                AssignmentStatus.IN_TRANSIT,
                AssignmentStatus.ARRIVED,
              ],
            },
            bookingId: { not: booking.id },
          },
          include: {
            booking: {
              include: { schedule: true },
            },
          },
        },
      },
    });

    if (!partner) {
      return {
        isEligible: false,
        errorCode: AssignmentErrorCode.DELIVERY_PARTNER_NOT_FOUND,
        reason: `Delivery Partner '${deliveryPartnerIdentifier}' was not found in organization`,
      };
    }

    // 2. Account Lifecycle Status Check
    if (partner.status !== DeliveryPartnerStatus.ACTIVE) {
      return {
        isEligible: false,
        errorCode: AssignmentErrorCode.DELIVERY_PARTNER_INACTIVE,
        reason: `Delivery Partner account is currently ${partner.status}, must be ACTIVE`,
        details: { status: partner.status },
      };
    }

    if (partner.approvalStatus !== DeliveryPartnerApprovalStatus.APPROVED) {
      return {
        isEligible: false,
        errorCode: AssignmentErrorCode.DELIVERY_PARTNER_NOT_ELIGIBLE,
        reason: `Delivery Partner approval status is ${partner.approvalStatus}, must be APPROVED`,
        details: { approvalStatus: partner.approvalStatus },
      };
    }

    // 3. Geographic Service Area Coverage Check
    if (booking.address?.postalCode) {
      const bookingPostal = booking.address.postalCode.trim();
      const servesPostal = partner.serviceAreas.some(
        (area) => area.isActive && area.postalCode.trim() === bookingPostal,
      );

      if (!servesPostal) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.DELIVERY_PARTNER_OUTSIDE_SERVICE_AREA,
          reason: `Delivery Partner does not service postal code '${bookingPostal}'`,
          details: { bookingPostalCode: bookingPostal },
        };
      }
    }

    // 4. Operating Availability Check
    if (booking.schedule?.pickupDate) {
      const pickupDate = new Date(booking.schedule.pickupDate);
      const dayOfWeek = pickupDate.getUTCDay();

      const dayAvailability = partner.availabilities.find(
        (avail) => avail.dayOfWeek === dayOfWeek,
      );

      if (!dayAvailability || !dayAvailability.isAvailable) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.DELIVERY_PARTNER_UNAVAILABLE,
          reason: `Delivery Partner is not available on day of week ${dayOfWeek}`,
          details: { dayOfWeek },
        };
      }

      // Operating hours window check
      const bookingSlotWindow = this.parseTimeSlotToWindow(
        booking.schedule.pickupTimeSlot,
      );
      const partnerOpenMinutes = this.parseTimeToMinutes(
        dayAvailability.startTime,
      );
      const partnerCloseMinutes = this.parseTimeToMinutes(
        dayAvailability.endTime,
      );

      if (
        bookingSlotWindow.startMinutes < partnerOpenMinutes ||
        bookingSlotWindow.endMinutes > partnerCloseMinutes
      ) {
        return {
          isEligible: false,
          errorCode: AssignmentErrorCode.DELIVERY_PARTNER_UNAVAILABLE,
          reason: `Booking pickup window (${booking.schedule.pickupTimeSlot}) is outside delivery partner operating hours (${dayAvailability.startTime} - ${dayAvailability.endTime})`,
          details: {
            slot: booking.schedule.pickupTimeSlot,
            operatingHours: `${dayAvailability.startTime} - ${dayAvailability.endTime}`,
          },
        };
      }

      // 5. Schedule Conflict Detection
      const targetDateStr = this.formatDateToDay(pickupDate);
      for (const activeAsn of partner.assignments) {
        if (!activeAsn.booking?.schedule?.pickupDate) continue;
        const activeDateStr = this.formatDateToDay(
          new Date(activeAsn.booking.schedule.pickupDate),
        );

        if (activeDateStr === targetDateStr) {
          const activeWindow = this.parseTimeSlotToWindow(
            activeAsn.booking.schedule.pickupTimeSlot,
          );
          if (this.intervalsOverlap(bookingSlotWindow, activeWindow)) {
            return {
              isEligible: false,
              errorCode:
                AssignmentErrorCode.DELIVERY_PARTNER_SCHEDULE_CONFLICT,
              reason: `Delivery partner has an overlapping active assignment (${activeAsn.publicId}) on ${targetDateStr} at slot '${activeAsn.booking.schedule.pickupTimeSlot}'`,
              details: {
                conflictingAssignmentPublicId: activeAsn.publicId,
                conflictingSlot: activeAsn.booking.schedule.pickupTimeSlot,
              },
            };
          }
        }
      }
    }

    return {
      isEligible: true,
      details: {
        deliveryPartnerId: partner.id,
        publicId: partner.publicId,
        fullName: partner.fullName,
      },
    };
  }

  /**
   * Discovers and evaluates all candidate providers in the organization for a booking.
   * Useful for Operations assignment UI modals.
   */
  async findEligibleProviders(
    booking: {
      id: string;
      organizationId: string;
      items: Array<{ variantId?: string | null; serviceId?: string | null }>;
      serviceId?: string;
      address?: { postalCode: string; city: string } | null;
      schedule?: { pickupDate: Date; pickupTimeSlot: string } | null;
    },
    organizationId: string,
  ): Promise<CandidateProviderEvaluation[]> {
    const providers = await this.prisma.provider.findMany({
      where: { organizationId },
      include: {
        serviceAreas: true,
        services: { include: { service: true } },
      },
    });

    const evaluations: CandidateProviderEvaluation[] = [];

    for (const p of providers) {
      const evalResult = await this.validateProviderEligibility(
        p.id,
        booking,
        organizationId,
      );

      const bookingCity = booking.address?.city?.toLowerCase() || '';
      const bookingPostal = booking.address?.postalCode?.trim() || '';

      const cityMatch = p.city?.toLowerCase() === bookingCity;
      const areaMatch = p.serviceAreas.some(
        (a) => a.isActive && a.postalCode.trim() === bookingPostal,
      );
      const categoryMatch =
        evalResult.errorCode !==
        AssignmentErrorCode.PROVIDER_SERVICE_NOT_SUPPORTED;

      const activeCount = await this.prisma.bookingAssignment.count({
        where: {
          organizationId,
          providerId: p.id,
          status: {
            in: [
              AssignmentStatus.ASSIGNED,
              AssignmentStatus.ACCEPTED,
              AssignmentStatus.IN_TRANSIT,
              AssignmentStatus.ARRIVED,
            ],
          },
        },
      });

      const workload: 'Low' | 'Medium' | 'High' =
        activeCount < 3 ? 'Low' : activeCount < 7 ? 'Medium' : 'High';

      const reasons: string[] = [];
      if (evalResult.isEligible) {
        reasons.push('Meets all service capabilities and service area coverage');
        reasons.push('Available for requested date and time slot');
      } else if (evalResult.reason) {
        reasons.push(evalResult.reason);
      }

      evaluations.push({
        id: p.id,
        name: p.businessName || p.fullName,
        rating: Number(p.rating),
        city: p.city,
        status: p.status,
        approvalStatus: p.approvalStatus,
        serviceCategories: p.services.map((s) => s.service?.name || 'Service'),
        areasServed: p.serviceAreas.map((a) => a.areaName || a.postalCode),
        activeBookingsCount: activeCount,
        workload,
        categoryMatch,
        cityMatch,
        areaMatch,
        isEligible: evalResult.isEligible,
        eligibilityReasons: reasons,
      });
    }

    // Sort eligible first, then by rating desc
    return evaluations.sort((a, b) => {
      if (a.isEligible === b.isEligible) {
        return b.rating - a.rating;
      }
      return a.isEligible ? -1 : 1;
    });
  }

  /**
   * Discovers and evaluates all candidate delivery partners in the organization for a booking.
   */
  async findEligibleDeliveryPartners(
    booking: {
      id: string;
      organizationId: string;
      address?: { postalCode: string; city: string } | null;
      schedule?: { pickupDate: Date; pickupTimeSlot: string } | null;
    },
    organizationId: string,
  ): Promise<CandidateDeliveryPartnerEvaluation[]> {
    const partners = await this.prisma.deliveryPartner.findMany({
      where: { organizationId },
      include: {
        serviceAreas: true,
      },
    });

    const evaluations: CandidateDeliveryPartnerEvaluation[] = [];

    for (const d of partners) {
      const evalResult = await this.validateDeliveryPartnerEligibility(
        d.id,
        booking,
        organizationId,
      );

      const bookingCity = booking.address?.city?.toLowerCase() || '';
      const bookingPostal = booking.address?.postalCode?.trim() || '';

      const cityMatch = d.city?.toLowerCase() === bookingCity;
      const areaMatch = d.serviceAreas.some(
        (a) => a.isActive && a.postalCode.trim() === bookingPostal,
      );

      const activeCount = await this.prisma.bookingAssignment.count({
        where: {
          organizationId,
          deliveryPartnerId: d.id,
          status: {
            in: [
              AssignmentStatus.ASSIGNED,
              AssignmentStatus.ACCEPTED,
              AssignmentStatus.IN_TRANSIT,
              AssignmentStatus.ARRIVED,
            ],
          },
        },
      });

      const workload: 'Low' | 'Medium' | 'High' =
        activeCount < 2 ? 'Low' : activeCount < 5 ? 'Medium' : 'High';

      const reasons: string[] = [];
      if (evalResult.isEligible) {
        reasons.push('Covers delivery location');
        reasons.push('Available during requested time slot');
      } else if (evalResult.reason) {
        reasons.push(evalResult.reason);
      }

      evaluations.push({
        id: d.id,
        name: d.fullName,
        rating: Number(d.rating),
        city: d.city,
        status: d.status,
        approvalStatus: d.approvalStatus,
        areasServed: d.serviceAreas.map((a) => a.areaName || a.postalCode),
        activeDeliveriesCount: activeCount,
        workload,
        vehicleType: d.vehicleType,
        cityMatch,
        areaMatch,
        isEligible: evalResult.isEligible,
        eligibilityReasons: reasons,
      });
    }

    return evaluations.sort((a, b) => {
      if (a.isEligible === b.isEligible) {
        return b.rating - a.rating;
      }
      return a.isEligible ? -1 : 1;
    });
  }
}
