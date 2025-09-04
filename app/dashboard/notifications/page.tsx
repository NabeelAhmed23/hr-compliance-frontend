"use client";

import React, { useState } from "react";
import { Bell, Filter, RefreshCw, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useInfiniteNotifications, useNotificationActions } from "@/lib/hooks/useNotifications";
import type { NotificationFilters, NotificationResponse } from "@/lib/types/notification";

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<NotificationFilters["type"]>();
  const [readFilter, setReadFilter] = useState<boolean>();

  const { unreadCount, refreshNotifications } = useNotificationContext();
  const { markAllAsRead } = useNotificationActions();

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteNotifications({
    type: typeFilter,
    unreadOnly: readFilter,
    limit: 20,
  });

  const notifications = infiniteData?.pages.flatMap(page => page.data.notifications) || [];
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
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const clearFilters = () => {
    setTypeFilter(undefined);
    setReadFilter(undefined);
  };

  const hasFilters = typeFilter || readFilter !== undefined;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your latest notifications and alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          {hasUnread && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Mark All Read
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <Select
                value={typeFilter || "all"}
                onValueChange={(value) => 
                  setTypeFilter(value === "all" ? undefined : value as NotificationResponse['type'])
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ALERT">Alerts</SelectItem>
                  <SelectItem value="REMINDER">Reminders</SelectItem>
                  <SelectItem value="INVITE">Invites</SelectItem>
                  <SelectItem value="DOCUMENT">Documents</SelectItem>
                  <SelectItem value="INFO">Information</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <Select
                value={readFilter === undefined ? "all" : readFilter ? "read" : "unread"}
                onValueChange={(value) => 
                  setReadFilter(
                    value === "all" ? undefined : 
                    value === "read" ? true : false
                  )
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Notifications</span>
            <Badge variant="secondary">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground max-w-sm">
                {hasFilters 
                  ? "No notifications match your current filters. Try adjusting your search criteria."
                  : "You're all caught up! New notifications will appear here."
                }
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    showActions={true}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasNextPage && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    className="w-full"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load more notifications"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}