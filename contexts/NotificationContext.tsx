"use client";

import React, { createContext, useContext, useState } from "react";
import { useNotificationStream } from "@/lib/hooks/useNotificationStream";
import { useNotifications } from "@/lib/hooks/useNotifications";
import type { NotificationResponse, NotificationFilters } from "@/lib/types/notification";

interface NotificationContextType {
  // Stream state
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  reconnect: () => void;

  // Notification state
  notifications: NotificationResponse[];
  isLoading: boolean;
  error: Error | null;

  // Filters and pagination
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;

  // Actions
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  streamEnabled?: boolean;
  fallbackToPolling?: boolean;
}

export function NotificationProvider({ 
  children, 
  streamEnabled = true,
  fallbackToPolling = true 
}: NotificationProviderProps) {
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
  });

  // Setup real-time stream
  const {
    unreadCount: streamUnreadCount,
    isConnected,
    isConnecting,
    reconnect,
  } = useNotificationStream({
    enabled: streamEnabled,
    fallbackToPolling,
  });

  // Fetch initial notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch: refreshNotifications,
  } = useNotifications(filters);

  // Extract notifications and fallback unread count
  const notifications = notificationsData?.data.notifications || [];
  const fallbackUnreadCount = notificationsData?.data.unreadCount || 0;

  // Use stream unread count if connected, otherwise use API data
  const unreadCount = isConnected ? streamUnreadCount : fallbackUnreadCount;

  const contextValue: NotificationContextType = {
    // Stream state
    unreadCount,
    isConnected,
    isConnecting,
    reconnect,

    // Notification state
    notifications,
    isLoading,
    error,

    // Filters and pagination
    filters,
    setFilters,

    // Actions
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}