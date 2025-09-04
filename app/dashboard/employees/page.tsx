"use client";

import { useState } from "react";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useCurrentUser } from "@/lib/hooks/use-auth";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog";
// import { InviteEmployeeDialog } from "@/components/employees/InviteEmployeeDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeesPage() {
  const [page] = useState(1);
  const { data: employeesData, isLoading } = useEmployees(page, 20);
  const { data: currentUser } = useCurrentUser();

  const isHROrAdmin =
    currentUser?.user?.role === "HR" || currentUser?.user?.role === "ADMIN";

  return (
    <div className="py-6 px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s employees and their compliance
            status
          </p>
        </div>
        {isHROrAdmin && (
          <div className="flex gap-2">
            {/* <InviteEmployeeDialog /> */}
            <AddEmployeeDialog />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            View and manage all employees in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <EmployeeTable
              employees={employeesData?.data?.employees || []}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {!isLoading && employeesData && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {employeesData.data.employees.length} of{" "}
            {employeesData.data.pagination.total} employees
          </div>
        </div>
      )}
    </div>
  );
}
