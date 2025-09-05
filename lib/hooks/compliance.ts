import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// Types
export interface ComplianceQueryParams {
  status?: "GREEN" | "YELLOW" | "RED";
  documentType?: string;
  includeMetrics?: boolean;
  sortBy?: "name" | "status" | "expiry";
  sortOrder?: "asc" | "desc";
}

export interface OrganizationComplianceResponse {
  success: boolean;
  message: string;
  data: {
    organizationId: string;
    summary: {
      green: number;
      yellow: number;
      red: number;
      total: number;
    };
    employees: Array<{
      employeeId: string;
      name: string;
      status: "GREEN" | "YELLOW" | "RED";
    }>;
    metrics?: {
      totalEmployees: number;
      totalDocuments: number;
      complianceSummary: {
        green: number;
        yellow: number;
        red: number;
      };
      documentsExpiringSoon: number;
      expiredDocuments: number;
      complianceRate: number;
      period: number;
      generatedAt: string;
      complianceGrade: string;
    };
  };
}

export interface EmployeeComplianceResponse {
  success: boolean;
  message: string;
  data: {
    employeeId: string;
    name: string;
    status: "GREEN" | "YELLOW" | "RED";
    documents: Array<{
      documentId: string;
      title: string;
      status: "GREEN" | "YELLOW" | "RED";
      expiresAt?: string;
      daysUntilExpiry?: number;
    }>;
  };
}

export interface MetricsQueryParams {
  period?: 30 | 60 | 90;
  includeProjections?: boolean;
}

export interface ComplianceMetricsResponse {
  success: boolean;
  message: string;
  data: {
    totalEmployees: number;
    totalDocuments: number;
    complianceSummary: {
      green: number;
      yellow: number;
      red: number;
    };
    documentsExpiringSoon: number;
    expiredDocuments: number;
    complianceRate: number;
    period: number;
    generatedAt: string;
    complianceGrade: string;
  };
}

export interface CriticalIssuesParams {
  maxDaysExpired?: number;
  documentType?: string;
  sortBy?: "employee" | "expiry" | "type";
}

export interface CriticalIssuesResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalEmployees: number;
      totalExpiredDocuments: number;
    };
    employees: Array<{
      employeeId: string;
      name: string;
      status: "RED";
      totalExpiredDocuments: number;
      expiredDocuments: Array<{
        documentId: string;
        title: string;
        type: string;
        expiredAt: string;
        daysExpired: number;
      }>;
    }>;
  };
}

export interface TypeComplianceParams {
  includeDetails?: boolean;
  minDocuments?: number;
}

export interface TypeComplianceResponse {
  success: boolean;
  message: string;
  data: {
    documentTypes: Array<{
      documentType: string;
      summary: {
        green: number;
        yellow: number;
        red: number;
        total: number;
      };
      documents?: Array<{
        documentId: string;
        title: string;
        status: "GREEN" | "YELLOW" | "RED";
        expiresAt?: string;
        daysUntilExpiry?: number;
      }>;
    }>;
    totalTypes: number;
  };
}

// Hooks
export const useOrganizationCompliance = (params?: ComplianceQueryParams) => {
  return useQuery({
    queryKey: ["organization-compliance", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await apiClient.get<OrganizationComplianceResponse>(
        `/dashboard/compliance${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEmployeeCompliance = (employeeId: string) => {
  return useQuery({
    queryKey: ["employee-compliance", employeeId],
    queryFn: async () => {
      const response = await apiClient.get<EmployeeComplianceResponse>(
        `/dashboard/compliance/${employeeId}`
      );
      return response.data;
    },
    enabled: !!employeeId,
  });
};

export const useComplianceMetrics = (params?: MetricsQueryParams) => {
  return useQuery({
    queryKey: ["compliance-metrics", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await apiClient.get<ComplianceMetricsResponse>(
        `/dashboard/compliance/metrics${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
  });
};

export const useCriticalIssues = (params?: CriticalIssuesParams) => {
  return useQuery({
    queryKey: ["critical-issues", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await apiClient.get<CriticalIssuesResponse>(
        `/dashboard/compliance/critical${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

export const useComplianceByType = (params?: TypeComplianceParams) => {
  return useQuery({
    queryKey: ["compliance-by-type", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await apiClient.get<TypeComplianceResponse>(
        `/dashboard/compliance/types${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    },
  });
};