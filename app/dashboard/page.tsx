import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverAuthApi } from "@/lib/api/server";
import { Users, FileText, Shield, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

const stats = [
  {
    name: "Total Employees",
    value: "124",
    icon: Users,
    change: "+12%",
    changeType: "increase",
  },
  {
    name: "Active Policies",
    value: "18",
    icon: FileText,
    change: "+2",
    changeType: "increase",
  },
  {
    name: "Compliance Score",
    value: "85%",
    icon: Shield,
    change: "+5%",
    changeType: "increase",
  },
  {
    name: "Training Completion",
    value: "92%",
    icon: TrendingUp,
    change: "+8%",
    changeType: "increase",
  },
];

const recentActivity = [
  {
    action: "Policy Updated",
    description: "Employee Handbook v2.1",
    timestamp: "2 hours ago",
    type: "policy",
  },
  {
    action: "Training Completed",
    description: "John Doe completed Security Training",
    timestamp: "4 hours ago",
    type: "training",
  },
  {
    action: "New Employee",
    description: "Sarah Wilson joined the team",
    timestamp: "1 day ago",
    type: "employee",
  },
  {
    action: "Compliance Report",
    description: "Q4 compliance report generated",
    timestamp: "2 days ago",
    type: "report",
  },
];

export default async function DashboardPage() {
  let user;
  try {
    user = await serverAuthApi.getCurrentUser();
  } catch (error) {
    // This shouldn't happen if layout is working, but just in case
    console.error("Failed to fetch user in dashboard page:", error);
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your HR compliance dashboard for{" "}
          {user?.organization.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="flex items-center">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and changes in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-sm">Add New Employee</div>
                  <div className="text-xs text-gray-600">
                    Onboard a new team member
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-sm">Create Policy</div>
                  <div className="text-xs text-gray-600">
                    Draft a new company policy
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-sm">Generate Report</div>
                  <div className="text-xs text-gray-600">
                    Create compliance reports
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="font-medium text-sm">Schedule Training</div>
                  <div className="text-xs text-gray-600">
                    Set up employee training
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
