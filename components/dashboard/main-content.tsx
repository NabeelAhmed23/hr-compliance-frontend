"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./dashboard-wrapper";
import type { User } from "@/lib/types/user";
import { Header } from "./header";

interface MainContentProps {
  user: User;
  children: React.ReactNode;
}

export function MainContent({ user, children }: MainContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}
    >
      {/* Header */}
      <Header user={user} />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 min-h-[calc(100vh-4rem)] px-4">
        {children}
      </main>
    </div>
  );
}
