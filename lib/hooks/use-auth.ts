import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { ApiError } from "../types/api";
import type {
  SignupFormValues,
  LoginFormValues,
  ForgotPasswordFormValues,
  AcceptInviteFormData,
} from "../validations/auth";
import type { LoginResponse } from "../types/user";

// Query keys
export const authKeys = {
  user: () => ["auth", "user"] as const,
};

// Use current user query
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if ((error as ApiError)?.code === 401) return false;
      return failureCount < 3;
    },
  });
}

// Registration mutation
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupFormValues) => authApi.register(data),
    onSuccess: () => {
      // Invalidate and refetch user data if login was included
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginFormValues) => authApi.login(data),
    onSuccess: (data: LoginResponse) => {
      // Set user data in cache
      queryClient.setQueryData(authKeys.user(), data);
      // No localStorage storage - cookies handle authentication
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // No localStorage to clear - cookies handled by server
    },
    onError: () => {
      // Even if logout fails, clear query cache
      queryClient.clear();
      // No localStorage to clear - cookies handled by server
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormValues) =>
      authApi.forgotPassword(data),
  });
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
  });
}

// Verify email mutation
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      // Refetch user data to update email verification status
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// Resend verification email mutation
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}
// Accept Email invitation
export function useAcceptInviteEmail() {
  return useMutation({
    mutationFn: (data: AcceptInviteFormData) => authApi.acceptInvite(data),
  });
}
