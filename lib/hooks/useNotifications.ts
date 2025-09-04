import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api/notifications";
import type {
  NotificationFilters,
  CreateNotificationRequest,
  NotificationListResponse,
  NotificationResponse,
} from "@/lib/types/notification";
import type { ApiError } from "@/lib/types/api";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const NOTIFICATION_STATS_QUERY_KEY = ["notification-stats"];

// Hook for fetching notifications with pagination
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, filters],
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Hook for infinite scroll notifications
export function useInfiniteNotifications(
  filters: Omit<NotificationFilters, "page"> = {}
) {
  return useInfiniteQuery<NotificationListResponse, Error>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getNotifications({
        ...filters,
        page: pageParam as number,
        limit: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

// Hook for notification statistics (HR/Admin)
export function useNotificationStats() {
  return useQuery({
    queryKey: NOTIFICATION_STATS_QUERY_KEY,
    queryFn: () => notificationsApi.getStats(),
    staleTime: 60000, // 1 minute
  });
}

// Hook for notification actions
export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_STATS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to mark notification as read");
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: (response) => {
      // Optimistically update all notifications to read
      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData: NotificationListResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: oldData.data.notifications.map(
                (notification: NotificationResponse) => ({
                  ...notification,
                  isRead: true,
                })
              ),
              unreadCount: 0,
            },
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_STATS_QUERY_KEY });

      toast.success(
        `Marked ${response.data.updatedCount} notifications as read`
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to mark all notifications as read");
    },
  });

  const deleteNotification = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: (_, notificationId) => {
      // Optimistically remove from cache
      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData: NotificationListResponse | undefined) => {
          if (!oldData) return oldData;

          const notification = oldData.data.notifications.find(
            (n: NotificationResponse) => n.id === notificationId
          );

          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: oldData.data.notifications.filter(
                (n: NotificationResponse) => n.id !== notificationId
              ),
              unreadCount:
                notification && !notification.isRead
                  ? Math.max(0, oldData.data.unreadCount - 1)
                  : oldData.data.unreadCount,
            },
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_STATS_QUERY_KEY });

      toast.success("Notification deleted");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });

  const createNotification = useMutation({
    mutationFn: (data: CreateNotificationRequest) =>
      notificationsApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_STATS_QUERY_KEY });

      toast.success("Notification created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create notification");
    },
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
}
