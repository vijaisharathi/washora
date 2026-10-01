/**
 * Type definitions for WASHORA Service Provider Availability & Scheduling (P5)
 */

export interface DayShiftSlot {
  id: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "18:00"
  isBreak?: boolean;
}

export interface DayAvailabilityConfig {
  dayKey: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  dayName: string;
  isOpen: boolean;
  slots: DayShiftSlot[];
}

export interface BlackoutDateItem {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isAllDay: boolean;
  customHours?: {
    startTime: string;
    endTime: string;
  };
}

export interface ProviderCapacityConfig {
  maxDailyOrders: number;
  maxConcurrentJobs: number;
  expressRushEnabled: boolean;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
}

export interface ProviderAvailabilityData {
  providerId: string;
  isOverallActive: boolean; // Active vs Paused studio bookings
  weeklySchedule: Record<string, DayAvailabilityConfig>;
  capacity: ProviderCapacityConfig;
  blackoutDates: BlackoutDateItem[];
  timezone: string;
  lastUpdated: string;
}

export interface UpdateWorkingHoursPayload {
  weeklySchedule: Record<string, DayAvailabilityConfig>;
}

export interface UpdateCapacityPayload {
  capacity: ProviderCapacityConfig;
}

export interface AddBlackoutDatePayload {
  date: string;
  reason: string;
  isAllDay?: boolean;
  customHours?: {
    startTime: string;
    endTime: string;
  };
}
