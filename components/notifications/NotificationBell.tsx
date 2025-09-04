"use client";

import React from "react";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface NotificationBellProps {
  onClick?: () => void;
  showConnectionStatus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function NotificationBell({
  onClick,
  showConnectionStatus = true,
  size = "md",
  className,
}: NotificationBellProps) {
  const { unreadCount, isConnected, isConnecting } = useNotificationContext();

  const bellSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const buttonSize = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  }[size];

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  const getConnectionTooltip = () => {
    if (isConnecting) return "Connecting to notifications...";
    if (!isConnected) return "Notifications disconnected. Click to reconnect.";
    return "Notifications connected";
  };

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(buttonSize, "relative", className)}
            onClick={onClick}
          >
            <Bell
              className={cn(
                bellSize,
                hasUnread && "animate-pulse",
                !isConnected && "text-muted-foreground"
              )}
            />

            {/* Unread count badge */}
            {hasUnread && (
              <Badge
                variant="destructive"
                className={cn(
                  "absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center text-xs font-bold px-1",
                  size === "sm" &&
                    "h-4 min-w-[1rem] text-[10px] -top-0.5 -right-0.5",
                  size === "lg" && "h-6 min-w-[1.5rem] -top-1.5 -right-1.5"
                )}
              >
                {displayCount}
              </Badge>
            )}

            {/* Connection status indicator */}
            {showConnectionStatus && (
              <div className="absolute -bottom-0.5 -right-0.5">
                {isConnecting ? (
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                ) : isConnected ? (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                ) : (
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                )}
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <div className="flex flex-col items-center gap-1">
            <span>
              {hasUnread
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "No unread notifications"}
            </span>
            {showConnectionStatus && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span>{getConnectionTooltip()}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
