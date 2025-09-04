"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./dashboard-wrapper";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Shield,
  LogOut,
  Building,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Policies",
    href: "/dashboard/policies",
    icon: FileText,
  },
  {
    name: "Compliance",
    href: "/dashboard/compliance",
    icon: Shield,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleLogout = async () => {
    try {
      // Call logout API
      await authApi.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force redirect even if API call fails
      window.location.href = "/login";
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex h-20 items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building className="h-5 w-5 text-white flex-shrink-0" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">SmartHR</h1>
              <p className="text-xs text-gray-500">Compliance Suite</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-4", isCollapsed ? "px-2" : "px-4")}>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    isCollapsed && "justify-center px-3"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      !isCollapsed && "mr-3",
                      isActive ? "text-primary" : "text-gray-500"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div
        className={cn("border-t border-gray-200", isCollapsed ? "p-2" : "p-6")}
      >
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors group relative",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Sign out" : ""}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>Sign out</span>}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Sign out
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
