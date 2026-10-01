import { isLiveMode } from "@/lib/api/mode";

export interface FunnelStepData {
  step: number;
  eventName: string;
  label: string;
  uniqueUsers: number;
  totalEvents: number;
  stepConversionRate: number;
  overallConversionRate: number;
  dropOffRate: number;
}

export interface FunnelReportData {
  summary: {
    totalFunnelStarts: number;
    totalFunnelCompletions: number;
    overallFunnelConversionRate: number;
  };
  steps: FunnelStepData[];
  deviceBreakdown: { device: string; count: number }[];
}

export interface ExperimentData {
  id: string;
  key: string;
  name: string;
  hypothesis: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CONCLUDED" | "CANCELLED";
  targetAudience: string;
  primaryMetric: string;
  totalAssignments: number;
  variants: {
    id: string;
    key: string;
    name: string;
    trafficAllocation: number;
    payloadJson?: any;
    participants?: number;
    conversionRate?: number;
    liftPercentage?: number;
    isStatisticallySignificant?: boolean;
  }[];
  createdAt: string;
}

export interface ImprovementData {
  id: string;
  title: string;
  problem: string;
  evidence: string;
  hypothesis: string;
  proposedChange: string;
  expectedImpact: string;
  priority: string;
  status: "IDEA" | "BACKLOG" | "PLANNED" | "IN_DEVELOPMENT" | "VALIDATING" | "ACCEPTED" | "REJECTED";
  owner: string;
  linkedKpi?: string;
  linkedExperimentKey?: string;
  decision?: string;
  createdAt: string;
}

export interface DataQualityAuditData {
  auditTimestamp: string;
  organizationId: string;
  metrics: {
    totalEventsAnalyzed: number;
    conformingEvents: number;
    schemaAdherencePercentage: number;
    tenantIsolationLeaks: number;
  };
  financialReconciliation: {
    reconciled: boolean;
    grossPaymentSum: number;
    grossRefundSum: number;
    calculatedNetRevenue: number;
  };
  status: "HEALTHY" | "WARNING" | "CRITICAL";
}

export const MOCK_FUNNEL_DATA: FunnelReportData = {
  summary: {
    totalFunnelStarts: 28450,
    totalFunnelCompletions: 3420,
    overallFunnelConversionRate: 12.02,
  },
  steps: [
    {
      step: 1,
      eventName: "customer.app.opened",
      label: "App Opened",
      uniqueUsers: 28450,
      totalEvents: 42100,
      stepConversionRate: 100.0,
      overallConversionRate: 100.0,
      dropOffRate: 0.0,
    },
    {
      step: 2,
      eventName: "customer.service.viewed",
      label: "Service Catalog Viewed",
      uniqueUsers: 19850,
      totalEvents: 31200,
      stepConversionRate: 69.8,
      overallConversionRate: 69.8,
      dropOffRate: 30.2,
    },
    {
      step: 3,
      eventName: "customer.booking.initiated",
      label: "Booking Initiated",
      uniqueUsers: 9450,
      totalEvents: 12800,
      stepConversionRate: 47.6,
      overallConversionRate: 33.2,
      dropOffRate: 52.4,
    },
    {
      step: 4,
      eventName: "customer.checkout.viewed",
      label: "Checkout & Schedule",
      uniqueUsers: 5600,
      totalEvents: 7100,
      stepConversionRate: 59.3,
      overallConversionRate: 19.7,
      dropOffRate: 40.7,
    },
    {
      step: 5,
      eventName: "customer.payment.completed",
      label: "Payment Processed",
      uniqueUsers: 3750,
      totalEvents: 4100,
      stepConversionRate: 67.0,
      overallConversionRate: 13.2,
      dropOffRate: 33.0,
    },
    {
      step: 6,
      eventName: "customer.booking.confirmed",
      label: "Order Confirmed",
      uniqueUsers: 3420,
      totalEvents: 3420,
      stepConversionRate: 91.2,
      overallConversionRate: 12.02,
      dropOffRate: 8.8,
    },
  ],
  deviceBreakdown: [
    { device: "mobile", count: 21450 },
    { device: "desktop", count: 6200 },
    { device: "tablet", count: 800 },
  ],
};

export const MOCK_EXPERIMENTS: ExperimentData[] = [
  {
    id: "exp-001",
    key: "exp_one_click_reorder_v2",
    name: "One-Click Quick Reorder on Customer Home",
    hypothesis: "Showing recent order shortcuts increases 14-day repeat rate by 4.5%",
    status: "ACTIVE",
    targetAudience: "CUSTOMER",
    primaryMetric: "customer.booking.confirmed",
    totalAssignments: 4820,
    variants: [
      {
        id: "v-001",
        key: "control",
        name: "Control (Standard Home)",
        trafficAllocation: 50,
        participants: 2410,
        conversionRate: 8.2,
        liftPercentage: 0.0,
      },
      {
        id: "v-002",
        key: "variant_a",
        name: "Quick Reorder Carousel",
        trafficAllocation: 50,
        participants: 2410,
        conversionRate: 9.8,
        liftPercentage: 19.5,
        isStatisticallySignificant: true,
      },
    ],
    createdAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "exp-002",
    key: "exp_provider_instant_payout_cta",
    name: "Prominent Instant Payout CTA in Partner Portal",
    hypothesis: "Clear daily earnings card increases job acceptance rate by 3%",
    status: "CONCLUDED",
    targetAudience: "PROVIDER",
    primaryMetric: "provider.job.accepted",
    totalAssignments: 620,
    variants: [
      {
        id: "v-003",
        key: "control",
        name: "Control (Standard Tab)",
        trafficAllocation: 50,
        participants: 310,
        conversionRate: 88.4,
        liftPercentage: 0.0,
      },
      {
        id: "v-004",
        key: "variant_payout_boost",
        name: "Sticky Payout Widget",
        trafficAllocation: 50,
        participants: 310,
        conversionRate: 94.2,
        liftPercentage: 6.6,
        isStatisticallySignificant: true,
      },
    ],
    createdAt: "2026-07-20T08:30:00.000Z",
  },
];

export const MOCK_IMPROVEMENTS: ImprovementData[] = [
  {
    id: "imp-001",
    title: "Streamline Slot Selection on Mobile",
    problem: "Drop-off of 40.7% detected between schedule step and payment screen on mobile viewports.",
    evidence: "Funnel step 4 analytics indicate average interaction time of 4.2 minutes on date-time picker.",
    hypothesis: "Grouping slots by Morning/Afternoon/Evening pill buttons will accelerate step completion by 30%.",
    proposedChange: "Redesign slot picker with sticky confirmation footer and default fastest slot selection.",
    expectedImpact: "+5.2% checkout conversion lift",
    priority: "P0",
    status: "IN_DEVELOPMENT",
    owner: "Frontend Engineering",
    linkedKpi: "FUNNEL_CONVERSION_RATE",
    linkedExperimentKey: "exp_slot_picker_v1",
    createdAt: "2026-09-01T11:00:00.000Z",
  },
  {
    id: "imp-002",
    title: "Instant Coupon Auto-Apply at Checkout",
    problem: "Users abandon checkout to search for external promotional codes.",
    evidence: "12% of abandoned checkouts had entered invalid coupon strings.",
    hypothesis: "Auto-applying the best applicable discount badge in the cart will reduce checkout abandonment.",
    proposedChange: "Display one-click 'Apply Best Offer' banner right inside booking breakdown.",
    expectedImpact: "+3.8% completed bookings",
    priority: "P1",
    status: "VALIDATING",
    owner: "Growth Team",
    linkedKpi: "CUSTOMER_REPEAT_RATE",
    createdAt: "2026-09-05T14:30:00.000Z",
  },
];

export const MOCK_DATA_QUALITY: DataQualityAuditData = {
  auditTimestamp: "2026-09-14T15:00:00.000Z",
  organizationId: "ORG-0001",
  metrics: {
    totalEventsAnalyzed: 94250,
    conformingEvents: 93890,
    schemaAdherencePercentage: 99.6,
    tenantIsolationLeaks: 0,
  },
  financialReconciliation: {
    reconciled: true,
    grossPaymentSum: 2486500.0,
    grossRefundSum: 42300.0,
    calculatedNetRevenue: 2444200.0,
  },
  status: "HEALTHY",
};

export const productAnalyticsService = {
  async getFunnelReport(): Promise<FunnelReportData> {
    if (isLiveMode()) {
      try {
        const res = await fetch("/api/v1/analytics/operations/funnel");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.steps) return json.data;
        }
      } catch (err) {
        // Fallback to mock
      }
    }
    return MOCK_FUNNEL_DATA;
  },

  async getExperiments(): Promise<ExperimentData[]> {
    if (isLiveMode()) {
      try {
        const res = await fetch("/api/v1/analytics/experiments");
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (err) {
        // Fallback to mock
      }
    }
    return MOCK_EXPERIMENTS;
  },

  async getImprovements(): Promise<ImprovementData[]> {
    if (isLiveMode()) {
      try {
        const res = await fetch("/api/v1/analytics/improvements");
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (err) {
        // Fallback to mock
      }
    }
    return MOCK_IMPROVEMENTS;
  },

  async getDataQualityAudit(): Promise<DataQualityAuditData> {
    if (isLiveMode()) {
      try {
        const res = await fetch("/api/v1/analytics/admin/data-quality");
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (err) {
        // Fallback to mock
      }
    }
    return MOCK_DATA_QUALITY;
  },
};
