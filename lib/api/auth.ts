import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { AuthUser, LoginResponse, RegisterResponse } from "../types/user";
import type {
  SignupFormValues,
  LoginFormValues,
  ForgotPasswordFormValues,
  AcceptInviteFormData,
} from "../validations/auth";

export const authApi = {
  // Register a new user
  register: async (data: SignupFormValues): Promise<RegisterResponse> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      "/auth/signup",
      data
    );
    return response.data.data;
  },

  // Login user
  login: async (data: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );

    // No token storage needed - cookies handled by server

    return response.data.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
    // No token clearing needed - cookies handled by server
  },

  // Forgot password
  forgotPassword: async (
    data: ForgotPasswordFormValues
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/forgot-password",
      data
    );
    return response.data.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/reset-password",
      {
        token,
        password,
      }
    );
    return response.data.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/verify-email",
      {
        token,
      }
    );
    return response.data.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/resend-verification",
      {
        email,
      }
    );
    return response.data.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return response.data.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/refresh",
      {
        refreshToken,
      }
    );

    // No token storage needed - cookies handled by server

    return response.data.data;
  },

  // Accept invite email
  acceptInvite: async (data: AcceptInviteFormData): Promise<void> => {
    await apiClient.post<ApiResponse<AcceptInviteFormData>>(
      "/auth/accept-invite",
      data
    );
  },
};
