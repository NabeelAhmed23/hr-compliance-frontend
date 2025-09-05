import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  DocumentsResponse,
  DocumentResponse,
  DeleteDocumentResponse,
  UploadDocumentRequest,
  UpdateDocumentRequest,
  ListDocumentsParams,
  MyDocumentsParams,
  ExportDocumentsParams,
} from "@/lib/types/document";

// Upload Document
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadDocumentRequest) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("type", data.type);
      if (data.employeeId) formData.append("employeeId", data.employeeId);
      if (data.expiresAt) formData.append("expiresAt", data.expiresAt);
      if (data.metadata)
        formData.append("metadata", JSON.stringify(data.metadata));

      const response = await apiClient.post<DocumentResponse>(
        "/documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

// List Documents
export const useListDocuments = (params?: ListDocumentsParams) => {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await apiClient.get<DocumentsResponse>(
        `/documents${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
  });
};

// Get Document Details
export const useGetDocument = (documentId: string) => {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const response = await apiClient.get<DocumentResponse>(
        `/documents/${documentId}`
      );
      return response.data;
    },
    enabled: !!documentId,
  });
};

// Update Document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDocumentRequest;
    }) => {
      const response = await apiClient.put<DocumentResponse>(
        `/documents/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({
        queryKey: ["document", data.data.id],
      });
    },
  });
};

// Delete Document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiClient.delete<DeleteDocumentResponse>(
        `/documents/${documentId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

// Get My Documents
export const useMyDocuments = (params?: MyDocumentsParams) => {
  return useQuery({
    queryKey: ["my-documents", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await apiClient.get<DocumentsResponse>(
        `/my-documents${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
  });
};

// Export Documents
export const useExportDocuments = () => {
  const exportDocuments = async (params?: ExportDocumentsParams) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    const response = await apiClient.get(
      `/documents/export${queryString ? `?${queryString}` : ""}`,
      {
        responseType: "blob",
      }
    );

    // Get filename from Content-Disposition header
    const contentDisposition =
      response.headers["content-disposition"] ||
      response.headers["Content-Disposition"];
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || "documents-export.zip";

    // Create download link
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return { exportDocuments };
};