"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useGetDocument, useDeleteDocument } from "@/lib/hooks/documents";
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  FileText,
  User,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DocumentViewPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useGetDocument(documentId);
  const deleteMutation = useDeleteDocument();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(documentId);
      toast.success("Document deleted successfully");
      router.push("/dashboard/documents");
    } catch {
      toast.error("Failed to delete document");
    }
    setDeleteDialogOpen(false);
  };

  const handleDownload = () => {
    if (data?.data.downloadUrl) {
      window.open(data.data.downloadUrl, "_blank");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
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
            Failed to load document. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const document = data?.data;
  if (!document) {
    return (
      <div className="p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Document not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isExpired =
    document.expiresAt && new Date(document.expiresAt) < new Date();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center gap-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Title and Actions */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {document.title}
          </h1>
          <p className="text-muted-foreground">
            Uploaded by {document.uploadedBy.firstName}{" "}
            {document.uploadedBy?.lastName} on{" "}
            {format(new Date(document.createdAt), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/documents/${documentId}/edit`)
            }
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {isExpired && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This document expired on{" "}
            {format(new Date(document.expiresAt!), "PPP")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">File Name</Label>
                  <p className="text-sm mt-1">{document.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Size</Label>
                  <p className="text-sm mt-1">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Type</Label>
                  <p className="text-sm mt-1">{document.mimeType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {document.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {document.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {document.metadata && Object.keys(document.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(document.metadata).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <Label className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <p className="text-sm col-span-2">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Document Type</Label>
                <Badge variant="outline" className="mt-1 block w-fit">
                  {document.type.replace(/_/g, " ")}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned Employee
                </Label>
                <p className="text-sm mt-1">
                  {document.employee.firstName} {document.employee?.lastName}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiry Date
                </Label>
                {document.expiresAt ? (
                  <p
                    className={cn(
                      "text-sm mt-1",
                      isExpired && "text-red-500 font-medium"
                    )}
                  >
                    {format(new Date(document.expiresAt), "PPP")}
                    {isExpired && " (Expired)"}
                  </p>
                ) : (
                  <p className="text-sm mt-1 text-gray-500">No expiry date</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upload Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Uploaded By</Label>
                <p className="text-sm mt-1">
                  {document.uploadedBy.firstName}{" "}
                  {document.uploadedBy?.lastName}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Upload Date</Label>
                <p className="text-sm mt-1">
                  {format(new Date(document.createdAt), "PPp")}
                </p>
              </div>

              {document.updatedAt &&
                document.updatedAt !== document.createdAt && (
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm mt-1">
                      {format(new Date(document.updatedAt), "PPp")}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/documents`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View All Documents
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/dashboard/documents?type=${document.type}`)
                }
              >
                <Tag className="h-4 w-4 mr-2" />
                View Similar Documents
              </Button>
              {document.employeeId && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(
                      `/dashboard/employees/${document.employeeId}/compliance`
                    )
                  }
                >
                  <User className="h-4 w-4 mr-2" />
                  View Employee Compliance
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{document?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
