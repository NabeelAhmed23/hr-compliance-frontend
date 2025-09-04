import { Sidebar } from "@/components/dashboard/sidebar";
import { MainContent } from "@/components/dashboard/main-content";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { serverAuthApi } from "@/lib/api/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await serverAuthApi.getCurrentUser();

  return (
    <TooltipProvider>
      <NotificationProvider>
        <DashboardWrapper>
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50">
            <Sidebar />
          </aside>

          {/* Main content */}
          <MainContent user={user.user}>{children}</MainContent>
        </DashboardWrapper>
      </NotificationProvider>
    </TooltipProvider>
  );
}
