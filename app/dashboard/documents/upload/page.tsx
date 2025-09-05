"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUploadDocument } from "@/lib/hooks/documents";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { DocumentType } from "@/lib/types/document";
import type { Employee } from "@/lib/types/employee";
import {
  Upload,
  FileText,
  CheckCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  type: z.nativeEnum(DocumentType, { message: "Document type is required" }),
  employeeId: z.string().optional(),
  expiresAt: z.date().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function DocumentUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useUploadDocument();
  const { data: employeesData } = useEmployees();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      type: DocumentType.OTHER,
      employeeId: "",
      expiresAt: undefined,
    },
  });

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      toast.error("File type not supported");
      return;
    }

    setFile(selectedFile);

    // Auto-fill title from filename if empty
    if (!form.getValues("title")) {
      const fileName = selectedFile.name.split(".")[0];
      form.setValue("title", fileName);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await uploadMutation.mutateAsync({
        file,
        ...data,
        employeeId: data.employeeId === "NONE" ? undefined : data.employeeId,
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
      });

      setUploadProgress(100);
      toast.success("Document uploaded successfully");

      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 1000);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-6">
      {/* Header */}
      {/* <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div> */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600 mt-2">
          Upload a new document to the system
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 grid grid-cols-2 space-x-4"
        >
          {/* File Upload */}
          <div className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Select File</CardTitle>
                <CardDescription>
                  Choose a file to upload. Maximum size: 10MB
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors h-full grid place-items-center",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400",
                    file && "border-green-500 bg-green-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="font-medium text-green-700">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-lg font-medium">
                        Drop files here or click to browse
                      </p>
                      <p className="text-sm text-gray-600">
                        Supports: PDF, Word, Excel, Images, Text files
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      handleFileChange(selectedFile);
                    }
                  }}
                  className="hidden"
                  id="file-input"
                />

                {!file && (
                  <Label
                    htmlFor="file-input"
                    className="block w-full cursor-pointer mt-4"
                  >
                    <Button type="button" className="w-full" asChild>
                      <span>
                        <FileText className="h-4 w-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </Label>
                )}

                {uploadProgress > 0 && (
                  <div className="space-y-2 pt-6">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>
                Provide information about the document
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel>Assign to Employee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          captionLayout="dropdown"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={uploadMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!file || uploadMutation.isPending}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
