import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api/notifications";
import type { SSEEvent, NotificationResponse, NotificationListResponse } from "@/lib/types/notification";

interface UseNotificationStreamOptions {
  enabled?: boolean;
  fallbackToPolling?: boolean;
  pollingInterval?: number;
  maxReconnectAttempts?: number;
}

interface ConnectionState {
  status: "connecting" | "connected" | "disconnected" | "error";
  reconnectAttempts: number;
  lastEventId?: string;
  lastPollingTime?: Date;
}

export function useNotificationStream(
  options: UseNotificationStreamOptions = {}
) {
  const {
    enabled = true,
    fallbackToPolling = true,
    pollingInterval = 30000, // 30 seconds
    maxReconnectAttempts = 5,
  } = options;

  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: "disconnected",
    reconnectAttempts: 0,
    lastPollingTime: new Date(),
  });

  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Handle new notifications
  const handleNewNotification = useCallback(
    (notification: NotificationResponse) => {
      // Update cache with new notification
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: NotificationListResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: [notification, ...oldData.data.notifications],
              unreadCount:
                oldData.data.unreadCount + (notification.isRead ? 0 : 1),
            },
          };
        }
      );

      // Show toast for important notifications
      if (notification.type === "ALERT" || notification.type === "REMINDER") {
        toast(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      }
    },
    [queryClient]
  );

  // Handle unread count updates
  const handleUnreadCountUpdate = useCallback(
    (count: number) => {
      setUnreadCount(count);

      // Update all notification queries with new unread count
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: NotificationListResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              unreadCount: count,
            },
          };
        }
      );
    },
    [queryClient]
  );

  // Exponential backoff for reconnection
  const getReconnectDelay = (attempt: number) => {
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  // Setup SSE connection
  const setupEventSource = useCallback(() => {
    if (!enabled || eventSourceRef.current) return;

    setConnectionState((prev) => ({ ...prev, status: "connecting" }));
    
    try {
      // Use proxied endpoint to avoid CORS issues
      const eventSource = new EventSource('/api/notifications/stream', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        setConnectionState({
          status: "connected",
          reconnectAttempts: 0,
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);

          switch (sseEvent.type) {
            case "connected":
              console.log("SSE connected:", sseEvent.message);
              break;

            case "notification":
              if (sseEvent.data && typeof sseEvent.data === 'object' && sseEvent.data !== null && 'id' in sseEvent.data) {
                handleNewNotification(sseEvent.data as NotificationResponse);
              }
              break;

            case "unread_count":
              if (typeof sseEvent.data === "number") {
                handleUnreadCountUpdate(sseEvent.data);
              }
              break;

            case "ping":
              // Keep-alive ping, no action needed
              break;

            default:
              console.log("Unknown SSE event type:", sseEvent.type);
          }

          setConnectionState((prev) => ({
            ...prev,
            lastEventId: event.lastEventId || prev.lastEventId,
          }));
        } catch (error) {
          console.error("Error parsing SSE event:", error);
        }
      };

      eventSource.onerror = (event) => {
        console.error("SSE Error:", event);
        
        setConnectionState((prev) => {
          const newAttempts = prev.reconnectAttempts + 1;

          // On first error, immediately try polling fallback if it's a CORS error
          if (newAttempts === 1 && fallbackToPolling) {
            console.warn("SSE connection failed, falling back to polling");
            cleanup();
            setupPolling();
            return {
              ...prev,
              status: "connected", // Polling will be connected
              reconnectAttempts: 0,
            };
          }

          if (newAttempts < maxReconnectAttempts) {
            // Schedule reconnection
            const delay = getReconnectDelay(newAttempts);
            reconnectTimeoutRef.current = setTimeout(() => {
              cleanup();
              setupEventSource();
            }, delay);

            return {
              ...prev,
              status: "error",
              reconnectAttempts: newAttempts,
            };
          } else {
            // Max attempts reached, fallback to polling if enabled
            if (fallbackToPolling) {
              setupPolling();
            }

            return {
              ...prev,
              status: "disconnected",
            };
          }
        });
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Failed to create EventSource:", error);
      if (fallbackToPolling) {
        setupPolling();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    handleNewNotification,
    handleUnreadCountUpdate,
    maxReconnectAttempts,
    fallbackToPolling,
  ]);

  // Setup polling fallback
  const setupPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    setConnectionState((prev) => ({ ...prev, status: "connected" }));

    const poll = async () => {
      try {
        const currentTime = new Date();
        setConnectionState((prevState) => {
          // Use the current state to get the last polling time
          const since = prevState.lastPollingTime || new Date(Date.now() - 60000);
          
          notificationsApi.getPolling({
            since,
            limit: 50,
          }).then((response) => {
            if (response.data.notifications.length > 0) {
              response.data.notifications.forEach(handleNewNotification);
            }

            handleUnreadCountUpdate(response.data.unreadCount);

            setConnectionState((prev) => ({
              ...prev,
              lastEventId: response.data.lastEventId,
              lastPollingTime: currentTime,
            }));
          }).catch((error) => {
            console.error("Polling error:", error);
          });

          return prevState;
        });
      } catch (error) {
        console.error("Polling setup error:", error);
      }
    };

    // Initial poll
    poll();

    // Setup interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval);
  }, [
    handleNewNotification,
    handleUnreadCountUpdate,
    pollingInterval,
  ]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    cleanup();
    setConnectionState({
      status: "disconnected",
      reconnectAttempts: 0,
    });
    setupEventSource();
  }, [cleanup, setupEventSource]);

  // Setup connection on mount
  useEffect(() => {
    if (enabled) {
      // Try SSE first
      if (typeof EventSource !== "undefined") {
        setupEventSource();
      } else if (fallbackToPolling) {
        // Browser doesn't support SSE, use polling
        setupPolling();
      }
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, setupEventSource, setupPolling, cleanup]);

  return {
    connectionState,
    unreadCount,
    reconnect,
    isConnected: connectionState.status === "connected",
    isConnecting: connectionState.status === "connecting",
  };
}
