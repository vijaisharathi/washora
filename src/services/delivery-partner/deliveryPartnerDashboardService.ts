import { DeliveryPartnerDashboardSummary } from "@/types/delivery-partner";
import { MOCK_DELIVERY_PARTNER_DASHBOARD_SUMMARY } from "@/mocks/delivery-partner/dashboard.mock";
import { deliveryPartnerProfileService } from "./deliveryPartnerProfileService";
import { deliveryPartnerEarningsService } from "./deliveryPartnerEarningsService";
import { isLiveMode } from "@/lib/api/mode";

export interface IDeliveryPartnerDashboardService {
  getDashboardSummary(): Promise<DeliveryPartnerDashboardSummary>;
}

class DeliveryPartnerDashboardService implements IDeliveryPartnerDashboardService {
  async getDashboardSummary(): Promise<DeliveryPartnerDashboardSummary> {
    await new Promise((res) => setTimeout(res, 60));

    // Dynamic sync with profile
    const fullProfile = await deliveryPartnerProfileService.getFullProfile();

    let todayEarnings = MOCK_DELIVERY_PARTNER_DASHBOARD_SUMMARY.todayEarningsAmount;
    if (isLiveMode()) {
      try {
        const earnings = await deliveryPartnerEarningsService.getEarningsSummary();
        todayEarnings = earnings.todayEarnings;
      } catch {
        // use default
      }
    }

    return {
      ...MOCK_DELIVERY_PARTNER_DASHBOARD_SUMMARY,
      hubName: fullProfile.hubName || MOCK_DELIVERY_PARTNER_DASHBOARD_SUMMARY.hubName,
      todayEarningsAmount: todayEarnings,
      metrics: {
        ...MOCK_DELIVERY_PARTNER_DASHBOARD_SUMMARY.metrics,
        customerRating: fullProfile.rating,
        totalTrips: fullProfile.totalDeliveries,
        onTimeRate: fullProfile.onTimeRate,
        acceptanceRate: fullProfile.acceptanceRate,
      },
    };
  }
}

export const deliveryPartnerDashboardService = new DeliveryPartnerDashboardService();
