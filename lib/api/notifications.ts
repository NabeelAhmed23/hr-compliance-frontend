import { apiClient } from "./client";
import type {
  NotificationResponse,
  NotificationListResponse,
  NotificationStatsResponse,
  CreateNotificationRequest,
  NotificationFilters,
  PollingParams,
} from "@/lib/types/notification";

export const notificationsApi = {
  // Get notifications with pagination and filters
  getNotifications: async (filters: NotificationFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.unreadOnly !== undefined)
      params.append("unreadOnly", filters.unreadOnly.toString());
    if (filters.since) params.append("since", filters.since.toISOString());

    const response = await apiClient.get<NotificationListResponse>(
      `/notifications?${params.toString()}`
    );
    return response.data;
  },

  // Create a new notification (HR/Admin only)
  createNotification: async (data: CreateNotificationRequest) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: NotificationResponse;
    }>("/notifications", data);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
    }>(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: { updatedCount: number };
    }>("/notifications/mark-all-read");
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/notifications/${id}`);
    return response.data;
  },

  // Get notification statistics (HR/Admin only)
  getStats: async () => {
    const response = await apiClient.get<NotificationStatsResponse>(
      "/notifications/stats"
    );
    return response.data;
  },

  // Polling endpoint for fallback
  getPolling: async (pollingParams: PollingParams) => {
    const params = new URLSearchParams();

    params.append("since", pollingParams.since.toISOString());
    if (pollingParams.limit) {
      params.append("limit", pollingParams.limit.toString());
    }

    const response = await apiClient.get<{
      success: boolean;
      data: {
        notifications: NotificationResponse[];
        unreadCount: number;
        lastEventId: string;
      };
    }>(`/notifications/polling?${params.toString()}`);
    return response.data;
  },
};
