"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useGetDocument, useUpdateDocument } from "@/lib/hooks/documents";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { DocumentType } from "@/lib/types/document";
import type { Employee } from "@/lib/types/employee";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Save, 
  FileText,
  AlertCircle,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").nullable(),
  type: z.nativeEnum(DocumentType, { message: "Document type is required" }),
  employeeId: z.string().nullable(),
  expiresAt: z.date().nullable(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: documentData, isLoading: documentLoading, error: documentError } = useGetDocument(documentId);
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  const updateMutation = useUpdateDocument();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      type: DocumentType.OTHER,
      employeeId: null,
      expiresAt: null,
    },
  });

  // Populate form with document data when loaded
  useEffect(() => {
    if (documentData?.data) {
      const doc = documentData.data;
      form.reset({
        title: doc.title,
        description: doc.description || null,
        type: doc.type,
        employeeId: doc.employeeId || null,
        expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
      });
    }
  }, [documentData, form]);

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    
    try {
      await updateMutation.mutateAsync({
        id: documentId,
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          employeeId: data.employeeId,
          expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
        },
      });

      toast.success("Document updated successfully");
      router.push(`/dashboard/documents/${documentId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update document");
      setIsSubmitting(false);
    }
  };

  if (documentLoading || employeesLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (documentError || !documentData?.data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load document. Please try again later.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={() => router.push("/dashboard/documents")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Button>
      </div>
    );
  }

  const document = documentData.data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/dashboard/documents/${documentId}`}
            className="inline-flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Document
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Edit Document</h1>
        <p className="text-muted-foreground mt-2">
          Update document information and metadata
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the document title and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Document title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the document"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide additional context about this document
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Document Properties */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Properties</CardTitle>
                  <CardDescription>
                    Configure document type and assignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Document Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(DocumentType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employee Assignment */}
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Employee</FormLabel>
                        <Select
                          onValueChange={(value) => 
                            field.onChange(value === "NONE" ? null : value)
                          }
                          value={field.value || "NONE"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            {employeesData?.data?.employees?.map(
                              (employee: Employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.firstName} {employee.lastName}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Assign this document to a specific employee
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Expiry Date */}
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expiry Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date (optional)</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Set when this document expires
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Information</CardTitle>
                  <CardDescription>
                    Current document details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">File Name</p>
                    <p className="text-sm mt-1">{document.fileName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">File Type</p>
                    <p className="text-sm mt-1">{document.mimeType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Size</p>
                    <p className="text-sm mt-1">
                      {(document.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={document.status === "active" ? "default" : "secondary"} className="mt-1">
                      {document.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                    <p className="text-sm mt-1">
                      {format(new Date(document.createdAt), "PPP")}
                    </p>
                  </div>

                  {document.updatedAt && document.updatedAt !== document.createdAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm mt-1">
                        {format(new Date(document.updatedAt), "PPP")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || updateMutation.isPending}
                  >
                    {isSubmitting || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/documents/${documentId}`)}
                    disabled={isSubmitting || updateMutation.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => form.reset()}
                    disabled={isSubmitting || updateMutation.isPending}
                  >
                    Reset Form
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}