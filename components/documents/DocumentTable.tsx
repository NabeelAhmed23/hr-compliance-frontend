"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Eye, MoreHorizontal, Edit, Trash2, Download, Calendar } from "lucide-react";
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
import { useDeleteDocument } from "@/lib/hooks/documents";
import type { Document } from "@/lib/types/document";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
}

export function DocumentTable({ documents, isLoading }: DocumentTableProps) {
  const router = useRouter();
  const deleteDocument = useDeleteDocument();
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document" />
      ),
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div>
            <div className="font-medium">{document.title}</div>
            <div className="text-sm text-muted-foreground">
              {document.fileName} ({formatFileSize(document.fileSize)})
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="outline">
            {type.replace(/_/g, " ")}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "employee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) => {
        const document = row.original;
        if (!document.employee) return "-";
        return `${document.employee.firstName} ${document.employee.lastName}`;
      },
      accessorFn: (row) => {
        if (!row.employee) return "";
        return `${row.employee.firstName} ${row.employee.lastName}`;
      },
      enableSorting: true,
    },
    {
      id: "uploadedBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uploaded By" />
      ),
      cell: ({ row }) => {
        const document = row.original;
        return `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`;
      },
      accessorFn: (row) => `${row.uploadedBy.firstName} ${row.uploadedBy.lastName}`,
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Upload Date" />
      ),
      cell: ({ row }) => {
        return format(new Date(row.getValue("createdAt")), "MMM dd, yyyy");
      },
      enableSorting: true,
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiry" />
      ),
      cell: ({ row }) => {
        const expiresAt = row.getValue("expiresAt") as string | undefined;
        if (!expiresAt) return "-";
        
        const isExpired = new Date(expiresAt) < new Date();
        return (
          <div
            className={cn(
              "text-sm flex items-center gap-1",
              isExpired && "text-red-500"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(expiresAt), "MMM dd, yyyy")}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const document = row.original;

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
                  router.push(`/dashboard/documents/${document.id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/documents/${document.id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit document
              </DropdownMenuItem>
              {document.downloadUrl && (
                <DropdownMenuItem
                  onClick={() => window.open(document.downloadUrl, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setDocumentToDelete(document)}
                disabled={deleteDocument.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocument.mutate(documentToDelete.id, {
        onSuccess: () => {
          setDocumentToDelete(null);
          toast.success("Document deleted successfully");
        },
        onError: () => {
          setDocumentToDelete(null);
          toast.error("Failed to delete document");
        },
      });
    }
  };

  if (isLoading) {
    return <DocumentTableSkeleton />;
  }

  return (
    <>
      <DataTable columns={columns} data={documents} searchKey="title" />

      <AlertDialog
        open={!!documentToDelete}
        onOpenChange={() => setDocumentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                &quot;{documentToDelete?.title}&quot;
              </span>
              ? This action cannot be undone and will permanently remove the
              document from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDocument.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={deleteDocument.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DocumentTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
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