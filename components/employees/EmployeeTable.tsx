"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Eye, MoreHorizontal, Mail, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useSendEmployeeInvite,
  useDeleteEmployee,
} from "@/lib/hooks/useEmployees";
import type { Employee } from "@/lib/types/employee";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  const router = useRouter();
  const sendInvite = useSendEmployeeInvite();
  const deleteEmployee = useDeleteEmployee();
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="font-medium">
            {employee.firstName} {employee.lastName}
          </div>
        );
      },
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        return <div className="lowercase">{row.getValue("email")}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "hasUser",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Status" />
      ),
      cell: ({ row }) => {
        const hasUser = row.getValue("hasUser") as boolean;
        return (
          <Badge variant={hasUser ? "default" : "secondary"}>
            {hasUser ? "Active" : "Pending"}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "dob",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date of Birth" />
      ),
      cell: ({ row }) => {
        const dob = row.getValue("dob") as string | null;
        return dob ? new Date(dob).toLocaleDateString() : "-";
      },
      enableSorting: true,
    },
    {
      id: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const employee = row.original;
        if (employee.city && employee.state) {
          return `${employee.city}, ${employee.state}`;
        }
        return employee.city || employee.state || "-";
      },
      accessorFn: (row) => {
        if (row.city && row.state) {
          return `${row.city}, ${row.state}`;
        }
        return row.city || row.state || "";
      },
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString();
      },
      enableSorting: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/employees/${employee.id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(employee.email)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy email
              </DropdownMenuItem>
              {!employee.hasUser && (
                <DropdownMenuItem
                  onClick={() => sendInvite.mutate({ id: employee.id })}
                  disabled={sendInvite.isPending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send invitation
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setEmployeeToDelete(employee)}
                disabled={deleteEmployee.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete employee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      deleteEmployee.mutate(employeeToDelete.id, {
        onSuccess: () => {
          setEmployeeToDelete(null);
        },
        onError: () => {
          // Error is already handled by the hook with toast
          setEmployeeToDelete(null);
        }
      });
    }
  };

  if (isLoading) {
    return <EmployeeTableSkeleton />;
  }

  return (
    <>
      <DataTable columns={columns} data={employees} searchKey="email" />
      
      <AlertDialog 
        open={!!employeeToDelete} 
        onOpenChange={() => setEmployeeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
              </span>
              ? This action cannot be undone and will permanently remove their record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEmployee.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              disabled={deleteEmployee.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EmployeeTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
    </div>
  );
}
