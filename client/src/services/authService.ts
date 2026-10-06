import apiClient from './api.client.js';
import { ApiResponse } from '../types/api.types.js';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type LoginResult =
  | { status: 'authenticated'; token: string; user: AdminProfile }
  | { status: 'otp_required'; otpSession: string; user: AdminProfile }
  | {
      status: '2fa_setup_required';
      setupToken: string;
      secret: string;
      otpauthUri: string;
      user: AdminProfile;
    };

export interface AuthSession {
  token: string;
  user: AdminProfile;
}

export interface DynamicSettings {
  'auth.otpLength': number;
  'auth.otpStepSeconds': number;
  'auth.otpWindowSteps': number;
  'auth.otpSessionTtlMinutes': number;
  'auth.requireOtp': boolean;
  'rateLimit.api.windowSec': number;
  'rateLimit.api.max': number;
  'rateLimit.login.windowSec': number;
  'rateLimit.login.max': number;
  'rateLimit.otp.windowSec': number;
  'rateLimit.otp.max': number;
}

export const authService = {
  /** Step 1: password check → returns the next step of the flow. */
  async login(email: string, password: string): Promise<LoginResult> {
    const response = await apiClient.post<ApiResponse<LoginResult>>('/api/auth/login', {
      email,
      password,
    });
    return response.data.data as LoginResult;
  },

  /** Step 2: verify the authenticator code and get the access token. */
  async verifyOtp(otpSession: string, otp: string): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/api/auth/verify-otp', {
      otpSession,
      otp,
    });
    return response.data.data as AuthSession;
  },

  /** Rotate the pending TOTP secret during first-time enrolment. */
  async setup2fa(setupToken: string): Promise<{ secret: string; otpauthUri: string }> {
    const response = await apiClient.post<ApiResponse<{ secret: string; otpauthUri: string }>>(
      '/api/auth/2fa/setup',
      { setupToken }
    );
    return response.data.data as { secret: string; otpauthUri: string };
  },

  /** Confirm the code, enable 2FA and complete the login. */
  async enable2fa(setupToken: string, otp: string): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/api/auth/2fa/enable', {
      setupToken,
      otp,
    });
    return response.data.data as AuthSession;
  },

  /** Current session profile (requires access token). */
  async me(): Promise<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }> {
    const response = await apiClient.get<
      ApiResponse<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }>
    >('/api/auth/me');
    return response.data.data as AdminProfile & {
      twoFactorEnabled: boolean;
      lastLoginAt: string | null;
    };
  },

  /** Public view of the dynamic OTP / rate-limit configuration. */
  async getSettings(): Promise<DynamicSettings> {
    const response = await apiClient.get<ApiResponse<DynamicSettings>>('/api/auth/settings');
    return response.data.data as DynamicSettings;
  },

  /** Superadmin-only runtime update — applied without a server restart. */
  async updateSettings(overrides: Partial<DynamicSettings>): Promise<DynamicSettings> {
    const response = await apiClient.put<ApiResponse<DynamicSettings>>(
      '/api/auth/settings',
      overrides
    );
    return response.data.data as DynamicSettings;
  },

  /** Change the signed-in account's password (current password required). */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
  },

  /** Turn 2FA off with a valid current authenticator code. */
  async disable2fa(otp: string): Promise<void> {
    await apiClient.post('/api/auth/2fa/disable', { otp });
  },

  /** Recovery path for a lost device — password re-verification instead of OTP. */
  async reset2fa(password: string): Promise<void> {
    await apiClient.post('/api/auth/2fa/reset', { password });
  },
};

export default authService;
