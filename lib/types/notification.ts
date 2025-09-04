export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: "INVITE" | "DOCUMENT" | "ALERT" | "REMINDER" | "INFO";
  metadata?: Record<string, unknown>;
  createdAt: string;
  organizationId: string;
  
  // Notification scope and targeting
  scope: "USER" | "ORGANIZATION" | "DEPARTMENT" | "ROLE";
  targetUserIds?: string[]; // For USER scope
  targetDepartmentIds?: string[]; // For DEPARTMENT scope  
  targetRoles?: string[]; // For ROLE scope
  
  // Current user's read status (from user_notifications junction table)
  isReadByCurrentUser: boolean;
  readAt?: string;
  
  // Aggregate stats for organization-wide notifications
  readCount?: number; // How many users have read this
  totalRecipients?: number; // Total users who should see this
  
  // Legacy field for backward compatibility
  userId?: string; // Deprecated: use scope and target fields instead
  isRead?: boolean; // Deprecated: use isReadByCurrentUser instead
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    unreadCount: number;
  };
}

export interface NotificationStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalNotifications: number;
    unreadCount: number;
    readCount: number;
    typeBreakdown: Record<NotificationResponse["type"], number>;
    recentActivity: {
      date: string;
      count: number;
    }[];
  };
}

export interface SSEEvent {
  type: "connected" | "notification" | "unread_count" | "ping";
  data?: unknown;
  message?: string;
  timestamp: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationResponse["type"];
  metadata?: Record<string, unknown>;
  userId?: string; // If targeting specific user, otherwise organization-wide
}

export interface NotificationFilters {
  type?: NotificationResponse['type'];
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  since?: Date;
}

export interface PollingParams {
  since: Date;
  limit?: number;
}

export const notificationIcons = {
  INVITE: "👥",
  DOCUMENT: "📄",
  ALERT: "⚠️",
  REMINDER: "⏰",
  INFO: "ℹ️",
} as const;

export const notificationColors = {
  INVITE: "blue",
  DOCUMENT: "green",
  ALERT: "red",
  REMINDER: "orange",
  INFO: "gray",
} as const;

export type NotificationColor =
  (typeof notificationColors)[keyof typeof notificationColors];
export type NotificationIcon =
  (typeof notificationIcons)[keyof typeof notificationIcons];
