"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useOrganizationCompliance,
  useComplianceMetrics,
  useCriticalIssues,
} from "@/lib/hooks/compliance";
import { Users, FileText, Shield, TrendingUp, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ComplianceEmployeeTable } from "@/components/employees/ComplianceEmployeeTable";
import { User } from "@/lib/types/user";
import { isHROrAdmin } from "@/lib/utils/permission";

const statusColors = {
  GREEN: "bg-green-500",
  YELLOW: "bg-yellow-500",
  RED: "bg-red-500",
};
function DashboardClient({ user }: { user: User }) {
  const router = useRouter();
  const { data: complianceOrgData, isLoading: complianceLoading } =
    useOrganizationCompliance({ includeMetrics: true });
  const { data: metricsData, isLoading: metricsLoading } =
    useComplianceMetrics();
  const { data: criticalData, isLoading: criticalLoading } =
    useCriticalIssues();

  const loading = complianceLoading || metricsLoading || criticalLoading;

  const complianceData = !isHROrAdmin(user.role)
    ? { data: { summary: metricsData?.data?.complianceSummary, employees: [] } }
    : complianceOrgData;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          HR Compliance Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor employee compliance status and document management
        </p>
      </div>

      {/* Critical Issues Alert */}
      {criticalData?.data?.summary?.totalExpiredDocuments &&
      criticalData.data.summary.totalExpiredDocuments > 0 ? (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p>
              <strong>{criticalData.data.summary.totalExpiredDocuments}</strong>{" "}
              expired{" "}
              {criticalData.data.summary.totalExpiredDocuments > 1
                ? "documents"
                : "document"}{" "}
              across <strong>{criticalData.data.summary.totalEmployees}</strong>{" "}
              {criticalData.data.summary.totalEmployees > 1
                ? "employees"
                : "employee"}{" "}
              require immediate attention.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Compliance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Employees */}
        {user && ["ADMIN", "HR", "SUPERADMIN"].includes(user?.role) && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Employees
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {metricsData?.data?.totalEmployees || 0}
                    </p>
                  )}
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Rate
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {metricsData?.data?.complianceRate || 0}%
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            {metricsData?.data?.complianceGrade && (
              <Badge className="mt-2" variant="secondary">
                Grade: {metricsData.data.complianceGrade}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Total Documents */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Documents
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {metricsData?.data?.totalDocuments || 0}
                  </p>
                )}
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
            {metricsData?.data?.documentsExpiringSoon &&
            metricsData.data.documentsExpiringSoon > 0 ? (
              <p className="text-sm text-yellow-600 mt-2">
                {metricsData.data.documentsExpiringSoon} expiring soon
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Status
                </p>
                {loading ? (
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${statusColors.GREEN} text-white`}>
                      {complianceData?.data?.summary?.green || 0}
                    </Badge>
                    <Badge className={`${statusColors.YELLOW} text-white`}>
                      {complianceData?.data?.summary?.yellow || 0}
                    </Badge>
                    <Badge className={`${statusColors.RED} text-white`}>
                      {complianceData?.data?.summary?.red || 0}
                    </Badge>
                  </div>
                )}
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Compliance Table */}
        {isHROrAdmin(user.role) && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Compliance Status</CardTitle>
                <CardDescription>
                  Overview of all employees and their compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <ComplianceEmployeeTable
                    employees={complianceData?.data?.employees || []}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Critical Issues */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Critical Issues</CardTitle>
              <CardDescription>
                Employees with expired documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : !criticalData?.data?.employees?.length ? (
                <div className="text-center py-4 text-gray-500">
                  No critical issues found
                </div>
              ) : (
                <div className="space-y-3">
                  {criticalData?.data?.employees
                    ?.slice(0, 5)
                    .map((employee) => (
                      <div
                        key={employee.employeeId}
                        className="p-3 border border-red-200 rounded-lg bg-red-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {employee.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {employee.expiredDocuments.length} expired{" "}
                              {employee.expiredDocuments.length === 1
                                ? "document"
                                : "documents"}{" "}
                              found
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              router.push(
                                `/dashboard/employees/${employee.employeeId}/compliance`
                              )
                            }
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  {criticalData?.data?.employees?.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/dashboard/critical")}
                    >
                      View All Critical Issues
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/employees")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add New Employee
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/documents")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/reports")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metrics last updated */}
      {metricsData?.data?.generatedAt && (
        <p className="text-xs text-gray-500 mt-8 text-center">
          Last updated: {format(new Date(metricsData.data.generatedAt), "PPp")}
        </p>
      )}
    </div>
  );
}

export default DashboardClient;
