import { Employee } from "./employee";

export enum DocumentType {
  CONTRACT = "CONTRACT",
  LICENSE = "LICENSE",
  CERTIFICATION = "CERTIFICATION",
  ID_PROOF = "ID_PROOF",
  INSURANCE = "INSURANCE",
  POLICY = "POLICY",
  MEDICAL = "MEDICAL",
  OTHER = "OTHER",
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  downloadUrl?: string;
  employeeId?: string;
  employee: Employee;
  uploadedById: string;
  uploadedBy: Employee;
  updatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  status: "active" | "deleted";
}

export interface UploadDocumentRequest {
  file: File;
  title: string;
  description?: string;
  type: DocumentType;
  employeeId?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string | null;
  type?: DocumentType;
  employeeId?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  type?: DocumentType;
  employeeId?: string;
  uploadedById?: string;
  expiresAfter?: string;
  expiresBefore?: string;
}

export interface MyDocumentsParams {
  page?: number;
  limit?: number;
  type?: DocumentType;
}

export interface ExportDocumentsParams {
  type?: DocumentType;
  employeeId?: string;
  uploadedById?: string;
  expiresAfter?: string;
  expiresBefore?: string;
  format?: "zip" | "json";
}

export interface DocumentsResponse {
  success: boolean;
  message: string;
  data: {
    documents: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DocumentResponse {
  success: boolean;
  message: string;
  data: Document;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
}
