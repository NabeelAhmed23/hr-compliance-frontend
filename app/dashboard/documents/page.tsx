"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { useListDocuments, useExportDocuments } from "@/lib/hooks/documents";
import { DocumentType, ListDocumentsParams } from "@/lib/types/document";
import { Plus, Download, FileText, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export default function DocumentsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<
    ListDocumentsParams & { page: number; limit: number }
  >({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useListDocuments(filters);
  const { exportDocuments } = useExportDocuments();

  // Filter documents by search term (client-side)
  const filteredDocuments = data?.data.documents?.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = async () => {
    try {
      await exportDocuments(filters);
      toast.success("Export started - download will begin shortly");
    } catch {
      toast.error("Failed to export documents");
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load documents. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage employee documents and compliance files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => router.push("/dashboard/documents/upload")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {data?.data.pagination.total || 0} documents found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentTable
            documents={filteredDocuments || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
