"use client";

import { Search, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useRouter } from "next/navigation";

import type { User } from "@/lib/types/user";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleViewAllNotifications = () => {
    router.push("/dashboard/notifications");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Back button and Search */}
      <div className="flex items-center space-x-4 flex-1">
        {/* Search bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search in HRMS"
            className="pl-10 pr-20 h-9 bg-gray-50 border-gray-200 rounded-md text-sm"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
            CTRL + /
          </span>
        </div>
      </div>

      {/* Right side - Icons and Profile */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <NotificationDropdown
          onViewAll={handleViewAllNotifications}
          className="w-96"
        />

        {/* User Avatar */}
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <AvatarFallback className="bg-orange-400 text-white text-xs font-medium">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
