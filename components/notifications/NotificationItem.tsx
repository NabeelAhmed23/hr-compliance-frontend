"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationActions } from "@/lib/hooks/useNotifications";
import type { NotificationResponse } from "@/lib/types/notification";
import { 
  getNotificationIcon, 
  getNotificationColorClass, 
  formatNotificationTime 
} from "@/lib/utils/notifications";

interface NotificationItemProps {
  notification: NotificationResponse;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: NotificationResponse) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  showActions = true,
  compact = false,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationActions();

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if ((notification.isReadByCurrentUser ?? notification.isRead ?? false)) return;
    
    try {
      await markAsRead.mutateAsync(notification.id);
      onMarkAsRead?.(notification.id);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await deleteNotification.mutateAsync(notification.id);
      onDelete?.(notification.id);
    } catch {
      // Error handled by mutation
    }
  };

  const handleClick = () => {
    onClick?.(notification);
    
    // Auto mark as read on click if not already read
    if (!(notification.isReadByCurrentUser ?? notification.isRead ?? false)) {
      handleMarkAsRead({ stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  const icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColorClass(notification.type);
  const timeAgo = formatNotificationTime(notification.createdAt);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 transition-colors hover:bg-accent/50 cursor-pointer border-l-2",
        (notification.isReadByCurrentUser ?? notification.isRead ?? false) ? "border-l-transparent" : `border-l-${colorClass}`,
        (notification.isReadByCurrentUser ?? notification.isRead ?? false) ? "opacity-75" : "",
        compact ? "p-2" : "p-3"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center rounded-full text-sm",
        compact ? "w-6 h-6 text-xs" : "w-8 h-8",
        (notification.isReadByCurrentUser ?? notification.isRead ?? false) ? "bg-muted" : `bg-${colorClass}-100`
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium truncate",
              (notification.isReadByCurrentUser ?? notification.isRead ?? false) ? "text-muted-foreground" : "text-foreground"
            )}>
              {notification.title}
            </p>
            {!compact && (
              <p className={cn(
                "text-xs mt-1 line-clamp-2",
                (notification.isReadByCurrentUser ?? notification.isRead ?? false) ? "text-muted-foreground/75" : "text-muted-foreground"
              )}>
                {notification.message}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!(notification.isReadByCurrentUser ?? notification.isRead ?? false) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleMarkAsRead}
                  disabled={markAsRead.isPending}
                  title="Mark as read"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteNotification.isPending}
                title="Delete notification"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs h-5",
                `bg-${colorClass}-50 text-${colorClass}-700 border-${colorClass}-200`
              )}
            >
              {notification.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>

          {!(notification.isReadByCurrentUser ?? notification.isRead ?? false) && (
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              `bg-${colorClass}-500`
            )} />
          )}
        </div>
      </div>
    </div>
  );
}

