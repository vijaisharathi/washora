import { User, CustomerProfile } from "@/types/customer";

export interface AuthSession {
  user: User;
  profile: CustomerProfile;
  token: string;
  expiresAt: string;
}

const STORAGE_KEY = "washora_auth_session";
let inMemorySession: AuthSession | null = null;

export const DEMO_USER: User = {
  id: "user-demo-1",
  name: "Arjun Verma",
  email: "arjun.verma@example.com",
  phone: "+91 98765 43210",
  role: "CUSTOMER",
  avatarUrl: "",
  createdAt: new Date().toISOString(),
};

export const DEMO_PROFILE: CustomerProfile = {
  id: "cust-demo-1",
  userId: DEMO_USER.id,
  name: DEMO_USER.name,
  email: DEMO_USER.email,
  phone: DEMO_USER.phone,
  isPhoneVerified: true,
  memberSince: "March 2024",
};

export const DEMO_OTP = "123456";

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return inMemorySession;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return inMemorySession;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return inMemorySession;
  }
}

export function setStoredSession(session: AuthSession): void {
  inMemorySession = session;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore localStorage write error
  }
}

export function clearStoredSession(): void {
  inMemorySession = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage remove error
  }
}
