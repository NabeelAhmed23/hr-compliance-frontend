"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeeCompliance } from "@/lib/hooks/compliance";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const statusIcons = {
  GREEN: CheckCircle,
  YELLOW: AlertCircle,
  RED: XCircle,
};

const statusColors = {
  GREEN: "bg-green-500",
  YELLOW: "bg-yellow-500",
  RED: "bg-red-500",
};

const statusLabels = {
  GREEN: "Valid",
  YELLOW: "Expiring Soon",
  RED: "Expired",
};

export default function EmployeeCompliancePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const { data, isLoading, error } = useEmployeeCompliance(employeeId);

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load compliance data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const employeeData = data?.data;
  const StatusIcon = statusIcons[employeeData?.status || "RED"];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center gap-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {employeeData?.name}&apos;s Compliance Status
        </h1>
        <p className="text-muted-foreground">
          View and manage compliance documents
        </p>
      </div>

      {/* Overall Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <StatusIcon
              className={cn(
                "h-8 w-8",
                employeeData?.status === "GREEN" && "text-green-500",
                employeeData?.status === "YELLOW" && "text-yellow-500",
                employeeData?.status === "RED" && "text-red-500"
              )}
            />
            <div>
              <Badge
                className={cn(
                  statusColors[employeeData?.status || "RED"],
                  "text-white"
                )}
              >
                {employeeData?.status}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {employeeData?.status === "GREEN" &&
                  "All documents are up to date"}
                {employeeData?.status === "YELLOW" &&
                  "Some documents are expiring soon"}
                {employeeData?.status === "RED" &&
                  "Some documents have expired"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Documents</CardTitle>
          <CardDescription>
            All required compliance documents and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employeeData?.documents?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Until Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeData?.documents?.map((doc) => {
                  const DocIcon = statusIcons[doc.status];
                  return (
                    <TableRow key={doc.documentId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {doc.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            statusColors[doc.status],
                            "text-white gap-1"
                          )}
                        >
                          <DocIcon className="h-3 w-3" />
                          {statusLabels[doc.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.expiresAt ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(new Date(doc.expiresAt), "MMM dd, yyyy")}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.daysUntilExpiry !== undefined ? (
                          <span
                            className={cn(
                              doc.daysUntilExpiry < 0 && "text-red-600",
                              doc.daysUntilExpiry >= 0 &&
                                doc.daysUntilExpiry <= 30 &&
                                "text-yellow-600",
                              doc.daysUntilExpiry > 30 && "text-green-600"
                            )}
                          >
                            {doc.daysUntilExpiry < 0
                              ? `${Math.abs(doc.daysUntilExpiry)} days overdue`
                              : `${doc.daysUntilExpiry} days`}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/documents/${doc.documentId}`
                            )
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
