"use client";

import { useParams, useRouter } from "next/navigation";
import { useEmployeeDetails, useSendEmployeeInvite } from "@/lib/hooks/useEmployees";
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
import {
  ArrowLeft,
  Mail,
  User,
  Calendar,
  MapPin,
  Building,
  UserCheck,
  Loader2,
} from "lucide-react";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const { data: employee, isLoading, error } = useEmployeeDetails(employeeId);
  const sendInvite = useSendEmployeeInvite();

  if (isLoading) {
    return <EmployeeDetailsSkeleton />;
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error
                  ? "Failed to load employee details"
                  : "Employee not found"}
              </p>
              <Button onClick={() => router.push("/dashboard/employees")}>
                Back to Employees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = () => {
    const parts = [employee.address, employee.city, employee.state, employee.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/employees")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>
                Personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={employee.hasUser ? "default" : "secondary"}>
                      {employee.hasUser ? "Account Created" : "Pending Invite"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{employee.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </div>
                  <p className="font-medium">{formatDate(employee.dob)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </div>
                  <p className="font-medium">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                  <p className="font-medium">{formatAddress()}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    User Account
                  </div>
                  <p className="font-medium">
                    {employee.hasUser ? "Active" : "Not Created"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!employee.hasUser && (
            <Card className={sendInvite.isSuccess ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
              <CardHeader>
                <CardTitle className={`text-lg ${sendInvite.isSuccess ? "text-green-800" : "text-amber-800"}`}>
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sendInvite.isSuccess ? (
                  <div className="space-y-3">
                    <p className="text-green-700">
                      ✓ Invitation sent successfully!
                    </p>
                    <p className="text-green-700 text-sm">
                      An email has been sent to {employee.email} with instructions to create their account.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-amber-700">
                      This employee has not yet created their account. Send them an invitation
                      email to complete the onboarding process.
                    </p>
                    <Button 
                      className="mt-4" 
                      variant="default"
                      onClick={() => sendInvite.mutate({ id: employeeId })}
                      disabled={sendInvite.isPending}
                    >
                      {sendInvite.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      {sendInvite.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">ID:</span>
                </div>
                <p className="font-mono text-xs">{employee.organizationId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmployeeDetailsSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Skeleton className="h-10 w-32" />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-12 w-12 mx-auto rounded-full" />
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
