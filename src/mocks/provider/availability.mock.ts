import { ProviderAvailabilityData } from "@/types/provider/availability";

export const MOCK_PROVIDER_AVAILABILITY: ProviderAvailabilityData = {
  providerId: "prov-1",
  isOverallActive: true,
  timezone: "Asia/Kolkata (IST +05:30)",
  lastUpdated: "2026-09-02T10:00:00Z",
  capacity: {
    maxDailyOrders: 25,
    maxConcurrentJobs: 12,
    expressRushEnabled: true,
    pickupWindowStart: "09:00",
    pickupWindowEnd: "18:00",
    deliveryWindowStart: "10:00",
    deliveryWindowEnd: "20:00",
  },
  weeklySchedule: {
    monday: {
      dayKey: "monday",
      dayName: "Monday",
      isOpen: true,
      slots: [{ id: "mon-1", startTime: "09:00", endTime: "19:00" }],
    },
    tuesday: {
      dayKey: "tuesday",
      dayName: "Tuesday",
      isOpen: true,
      slots: [{ id: "tue-1", startTime: "09:00", endTime: "19:00" }],
    },
    wednesday: {
      dayKey: "wednesday",
      dayName: "Wednesday",
      isOpen: true,
      slots: [{ id: "wed-1", startTime: "09:00", endTime: "19:00" }],
    },
    thursday: {
      dayKey: "thursday",
      dayName: "Thursday",
      isOpen: true,
      slots: [{ id: "thu-1", startTime: "09:00", endTime: "19:00" }],
    },
    friday: {
      dayKey: "friday",
      dayName: "Friday",
      isOpen: true,
      slots: [{ id: "fri-1", startTime: "09:00", endTime: "19:00" }],
    },
    saturday: {
      dayKey: "saturday",
      dayName: "Saturday",
      isOpen: true,
      slots: [{ id: "sat-1", startTime: "10:00", endTime: "18:00" }],
    },
    sunday: {
      dayKey: "sunday",
      dayName: "Sunday",
      isOpen: false,
      slots: [{ id: "sun-1", startTime: "10:00", endTime: "16:00" }],
    },
  },
  blackoutDates: [
    {
      id: "blk-1",
      date: "2026-09-10",
      reason: "Ganesh Chaturthi Public Holiday",
      isAllDay: true,
    },
    {
      id: "blk-2",
      date: "2026-10-02",
      reason: "Gandhi Jayanti Studio Maintenance",
      isAllDay: true,
    },
  ],
};
