import DashboardClient from "@/components/dashboard/dashboard-client";
import { serverApi } from "@/lib/api/server";

export default async function DashboardPage() {
  const user = await serverApi.getCurrentUser();
  return <DashboardClient user={user.user} />;
}
