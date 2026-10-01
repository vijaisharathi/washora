"use client";

import { AnalyticsEventCategoryType, AnalyticsEventNameType } from "@/modules/analytics/constants/event-taxonomy.constant";

interface EventPayload {
  eventName: AnalyticsEventNameType | string;
  eventCategory: AnalyticsEventCategoryType;
  properties?: Record<string, any>;
  actorRole?: string;
  sessionId?: string;
  anonymousId?: string;
}

const SENSITIVE_KEYS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /card_?number/i,
  /cvv/i,
  /private_?key/i,
];

function sanitize(obj?: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== "object") return {};
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((p) => p.test(k))) {
      clean[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      clean[k] = sanitize(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

let eventQueue: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

function getAnonymousId(): string {
  if (typeof window === "undefined") return "server-anon";
  let anonId = localStorage.getItem("washora_anon_id");
  if (!anonId) {
    anonId = `anon_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem("washora_anon_id", anonId);
  }
  return anonId;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  let sessId = sessionStorage.getItem("washora_sess_id");
  if (!sessId) {
    sessId = `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    sessionStorage.setItem("washora_sess_id", sessId);
  }
  return sessId;
}

export async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue = [];

  try {
    const isLive = process.env.NEXT_PUBLIC_API_MODE === "live";
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

    if (isLive && typeof window !== "undefined") {
      await fetch(`${baseUrl}/analytics/events/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
      });
    }
  } catch (err) {
    // Silently suppress telemetry network errors in production
  }
}

export function trackEvent(
  eventName: AnalyticsEventNameType | string,
  eventCategory: AnalyticsEventCategoryType,
  properties?: Record<string, any>,
  actorRole?: string,
): void {
  const event = {
    eventName,
    eventCategory,
    actorRole,
    sessionId: getSessionId(),
    anonymousId: getAnonymousId(),
    deviceType: typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop",
    properties: sanitize(properties),
    timestamp: new Date().toISOString(),
  };

  eventQueue.push(event);

  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }

  // Debounced batch flush
  flushTimeout = setTimeout(() => {
    void flushEvents();
  }, 2000);
}
