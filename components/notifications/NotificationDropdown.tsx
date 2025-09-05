"use client";

import React, { useState } from "react";
import { Check, Loader2, RefreshCw, Settings, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "./NotificationItem";
import { useNotificationContext } from "@/contexts/NotificationContext";
import {
  useNotificationActions,
  useInfiniteNotifications,
} from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export function NotificationDropdown({
  showViewAll = true,
  onViewAll,
  className,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);

  const { unreadCount, refreshNotifications } = useNotificationContext();
  const { markAllAsRead } = useNotificationActions();

  // Use infinite query for the dropdown
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteNotifications({
    limit: 10,
  });

  const notifications =
    infiniteData?.pages.flatMap((page) => page.data.notifications) || [];
  const hasUnread = unreadCount > 0;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch {
      // Error handled by mutation
    }
  };

  const handleRefresh = () => {
    refreshNotifications();
  };

  const handleViewAll = () => {
    setOpen(false);
    onViewAll?.();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const NotificationDropdownContent = () => (
    <DropdownMenuContent className={cn("w-80", className)} align="end">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-semibold">Notifications</span>
          {hasUnread && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0"
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>

          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="h-7 px-2 text-xs"
              title="Mark all as read"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <ScrollArea className="max-h-80">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {"No notifications"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
                onClick={() => setOpen(false)}
              />
            ))}

            {/* Load more button */}
            {hasNextPage && (
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="w-full h-8"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {showViewAll && (
        <>
          <DropdownMenuSeparator />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="w-full h-10"
          >
            <Settings className="h-3 w-3 mr-2" />
            View all notifications
          </Button>
        </>
      )}
    </DropdownMenuContent>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 relative">
          <Bell className="h-5 w-5" />
          {/* Unread count badge */}
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center text-xs font-bold px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount.toString()}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <NotificationDropdownContent />
    </DropdownMenu>
  );
}
