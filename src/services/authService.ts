import {
  AuthSession,
  DEMO_USER,
  DEMO_PROFILE,
  DEMO_OTP,
  getStoredSession,
  setStoredSession,
  clearStoredSession,
} from "@/mocks/customer/authMock";
import { LoginFormData, RegisterFormData } from "@/features/customer/schemas/authSchemas";
import { customerApi, AuthUserResponse } from "@/features/customer/api/customerApi";
import { isLiveMode, setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { setOrganizationId } from "@/lib/api/token-store";
import { clearUserQueryCache } from "@/lib/query/cache-isolation";
import { Role, User, CustomerProfile } from "@/types/customer";

export interface IAuthService {
  login(data: LoginFormData): Promise<AuthSession>;
  register(data: RegisterFormData): Promise<{ tempToken: string; phone: string }>;
  verifyPhoneOtp(phone: string, otp: string): Promise<AuthSession>;
  resendOtp(phone: string): Promise<{ success: boolean; message: string }>;
  requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }>;
  resetPassword(password: string): Promise<{ success: boolean; message: string }>;
  getCurrentSession(): Promise<AuthSession | null>;
  logout(): Promise<void>;
}

function mapAuthUserToSession(
  authUser: AuthUserResponse,
  accessToken: string,
  expiresIn?: number
): AuthSession {
  const phone = authUser.phone || "";
  const name = authUser.fullName || authUser.email.split("@")[0];

  const user: User = {
    id: authUser.id,
    name,
    email: authUser.email,
    phone,
    role: (authUser.role as Role) || "CUSTOMER",
    createdAt: new Date().toISOString(),
    avatarUrl: authUser.avatarUrl,
  };

  const profile: CustomerProfile = {
    id: authUser.id,
    userId: authUser.id,
    name,
    email: authUser.email,
    phone,
    avatarUrl: authUser.avatarUrl,
    isPhoneVerified: Boolean(authUser.isPhoneVerified),
    memberSince: "March 2024",
  };

  return {
    user,
    profile,
    token: accessToken,
    expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000).toISOString(),
  };
}

class AuthService implements IAuthService {
  async login(data: LoginFormData): Promise<AuthSession> {
    if (isLiveMode()) {
      const res = await customerApi.auth.login({
        identifier: data.identifier,
        email: data.identifier,
        password: data.password,
      });

      const { accessToken, refreshToken, expiresIn, user: authUser } = res.data;

      setTokens({
        accessToken,
        refreshToken,
        expiresIn,
      });

      // Verify customer role isolation
      let role = authUser?.role;
      try {
        const meRes = await customerApi.auth.getMe();
        if (meRes.data?.role) {
          role = meRes.data.role;
        }
      } catch {
        // Fall back to login user role
      }

      if (role && role !== "CUSTOMER") {
        clearTokens();
        clearStoredSession();
        throw new Error("Access restricted: This account is not a customer account.");
      }

      // Resolve organization context
      try {
        const orgsRes = await customerApi.auth.getOrganizations();
        const orgs = orgsRes.data || [];
        if (Array.isArray(orgs) && orgs.length > 0) {
          const defaultOrg = orgs.find((o: any) => o.role === "CUSTOMER") || orgs[0];
          setOrganizationId(defaultOrg.id || defaultOrg.publicId || "ORG-0001");
        } else {
          setOrganizationId("ORG-0001");
        }
      } catch {
        setOrganizationId("ORG-0001");
      }

      const session = mapAuthUserToSession(authUser, accessToken, expiresIn);
      setStoredSession(session);
      return session;
    }

    return this.loginMock(data);
  }

  private async loginMock(data: LoginFormData): Promise<AuthSession> {
    await new Promise((res) => setTimeout(res, 600));

    // Simulated error check
    if (data.identifier.toLowerCase().includes("error")) {
      throw new Error("Invalid mobile number/email or incorrect password.");
    }

    const session: AuthSession = {
      user: {
        ...DEMO_USER,
        email: data.identifier.includes("@") ? data.identifier : DEMO_USER.email,
        phone: !data.identifier.includes("@") ? data.identifier : DEMO_USER.phone,
      },
      profile: DEMO_PROFILE,
      token: `mock_jwt_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setStoredSession(session);
    return session;
  }

  async register(data: RegisterFormData): Promise<{ tempToken: string; phone: string }> {
    if (isLiveMode()) {
      const res = await customerApi.auth.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });

      const { tokens } = res.data;
      if (tokens?.accessToken) {
        setTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        });
      }

      return {
        tempToken: tokens?.accessToken || `reg_${Date.now()}`,
        phone: data.phone,
      };
    }

    return this.registerMock(data);
  }

  private async registerMock(data: RegisterFormData): Promise<{ tempToken: string; phone: string }> {
    await new Promise((res) => setTimeout(res, 700));

    if (data.email.toLowerCase() === "exists@example.com") {
      throw new Error("An account with this email address already exists. Please sign in.");
    }

    return {
      tempToken: `temp_reg_${Date.now()}`,
      phone: data.phone,
    };
  }

  async verifyPhoneOtp(phone: string, otp: string): Promise<AuthSession> {
    await new Promise((res) => setTimeout(res, 600));

    // Accept DEMO_OTP "123456" or any 6-digit number in mock mode unless it is "000000"
    if (otp === "000000") {
      throw new Error("Invalid verification code. Please check the SMS and try again.");
    }

    const session: AuthSession = {
      user: {
        ...DEMO_USER,
        phone: phone || DEMO_USER.phone,
      },
      profile: {
        ...DEMO_PROFILE,
        phone: phone || DEMO_PROFILE.phone,
        isPhoneVerified: true,
      },
      token: `mock_jwt_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setStoredSession(session);
    return session;
  }

  async resendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 500));
    return {
      success: true,
      message: `A new 6-digit verification code has been dispatched to ${phone}. Demo OTP: ${DEMO_OTP}`,
    };
  }

  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    if (isLiveMode()) {
      try {
        await customerApi.auth.forgotPassword(identifier);
      } catch {
        // Generic response per Rule 9: Never reveal whether an email exists
      }
      return {
        success: true,
        message: "If an account exists with this email address, password reset instructions have been sent.",
      };
    }

    return this.requestPasswordResetMock(identifier);
  }

  private async requestPasswordResetMock(identifier: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 600));
    return {
      success: true,
      message: "If an account exists with this email address, password reset instructions have been sent.",
    };
  }

  async resetPassword(password: string): Promise<{ success: boolean; message: string }> {
    if (isLiveMode()) {
      const token =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("token") || "reset-token"
          : "reset-token";

      const res = await customerApi.auth.resetPassword(token, password);
      clearTokens();
      clearStoredSession();
      clearUserQueryCache();
      return {
        success: true,
        message: res.data?.message || "Your password has been reset successfully. Please sign in with your new password.",
      };
    }

    return this.resetPasswordMock();
  }

  private async resetPasswordMock(): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 600));
    return {
      success: true,
      message: "Your password has been reset successfully. Please sign in with your new password.",
    };
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (isLiveMode()) {
      const token = getAccessToken();
      if (!token) {
        return null;
      }

      try {
        const res = await customerApi.auth.getMe();
        const authUser = res.data;
        const session = mapAuthUserToSession(authUser, token);
        setStoredSession(session);
        return session;
      } catch {
        // Token expired or invalid
        clearTokens();
        clearStoredSession();
        clearUserQueryCache();
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 100));
    return getStoredSession();
  }

  async logout(): Promise<void> {
    if (isLiveMode()) {
      try {
        await customerApi.auth.logout();
      } catch {
        // Ignore logout network errors
      } finally {
        clearTokens();
        clearStoredSession();
        clearUserQueryCache();
      }
      return;
    }

    await new Promise((res) => setTimeout(res, 200));
    clearStoredSession();
  }
}

export const authService = new AuthService();
