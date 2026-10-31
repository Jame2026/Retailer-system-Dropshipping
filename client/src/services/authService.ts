import apiClient from './api.client.js';
import { ApiResponse } from '../types/api.types.js';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
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

  async login(email: string, password: string): Promise<LoginResult> {
    const response = await apiClient.post<ApiResponse<LoginResult>>('/api/auth/login', {
      email,
      password,
    });
    return response.data.data as LoginResult;
  },

  async verifyOtp(otpSession: string, otp: string): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/api/auth/verify-otp', {
      otpSession,
      otp,
    });
    return response.data.data as AuthSession;
  },

  async googleLogin(credential: string): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/api/auth/google', {
      credential,
    });
    return response.data.data as AuthSession;
  },

  async setup2fa(setupToken: string): Promise<{ secret: string; otpauthUri: string }> {
    const response = await apiClient.post<ApiResponse<{ secret: string; otpauthUri: string }>>(
      '/api/auth/2fa/setup',
      { setupToken }
    );
    return response.data.data as { secret: string; otpauthUri: string };
  },

  async enable2fa(setupToken: string, otp: string): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/api/auth/2fa/enable', {
      setupToken,
      otp,
    });
    return response.data.data as AuthSession;
  },

  async me(): Promise<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }> {
    const response = await apiClient.get<
      ApiResponse<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }>
    >('/api/auth/me');
    return response.data.data as AdminProfile & {
      twoFactorEnabled: boolean;
      lastLoginAt: string | null;
    };
  },

  async updateAvatar(
    avatarUrl: string
  ): Promise<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }> {
    const response = await apiClient.put<
      ApiResponse<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }>
    >('/api/auth/avatar', { avatarUrl });
    return response.data.data as AdminProfile & {
      twoFactorEnabled: boolean;
      lastLoginAt: string | null;
    };
  },

  async updateProfile(
    name: string
  ): Promise<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }> {
    const response = await apiClient.put<
      ApiResponse<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }>
    >('/api/auth/profile', { name });
    return response.data.data as AdminProfile & {
      twoFactorEnabled: boolean;
      lastLoginAt: string | null;
    };
  },

  async initiate2fa(): Promise<{ setupToken: string; secret: string; otpauthUri: string }> {
    const response = await apiClient.post<
      ApiResponse<{ setupToken: string; secret: string; otpauthUri: string }>
    >('/api/auth/2fa/initiate');
    return response.data.data as { setupToken: string; secret: string; otpauthUri: string };
  },

  async removeAvatar(): Promise<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }> {
    const response = await apiClient.delete<
      ApiResponse<AdminProfile & { twoFactorEnabled: boolean; lastLoginAt: string | null }>
    >('/api/auth/avatar');
    return response.data.data as AdminProfile & {
      twoFactorEnabled: boolean;
      lastLoginAt: string | null;
    };
  },

  async getSettings(): Promise<DynamicSettings> {
    const response = await apiClient.get<ApiResponse<DynamicSettings>>('/api/auth/settings');
    return response.data.data as DynamicSettings;
  },

  async updateSettings(overrides: Partial<DynamicSettings>): Promise<DynamicSettings> {
    const response = await apiClient.put<ApiResponse<DynamicSettings>>(
      '/api/auth/settings',
      overrides
    );
    return response.data.data as DynamicSettings;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
  },

  async disable2fa(otp: string): Promise<void> {
    await apiClient.post('/api/auth/2fa/disable', { otp });
  },

  async reset2fa(password: string): Promise<void> {
    await apiClient.post('/api/auth/2fa/reset', { password });
  },
};

export default authService;
