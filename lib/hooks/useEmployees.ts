import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import type {
  EmployeeDetails,
  EmployeeListResponse,
  CreateEmployeeInput,
  InviteEmployeeInput,
} from "@/lib/types/employee";
import type { ApiError } from "@/lib/types/api";

const EMPLOYEES_QUERY_KEY = ["employees"];
const EMPLOYEE_DETAILS_QUERY_KEY = (id: string) => ["employee", id];

export function useEmployees(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...EMPLOYEES_QUERY_KEY, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<EmployeeListResponse>(
        `/employees?page=${page}&limit=${limit}`
      );
      return response.data;
    },
  });
}

export function useEmployeeDetails(id: string) {
  return useQuery({
    queryKey: EMPLOYEE_DETAILS_QUERY_KEY(id),
    queryFn: async () => {
      const response = await apiClient.get<EmployeeDetails>(`/employees/${id}`);
      return response.data.data.employee;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const response = await apiClient.post<EmployeeDetails>(
        "/employees",
        data
      );
      return response.data;
    },
    onSuccess: (newEmployee) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success(
        `Employee ${newEmployee.data.employee.firstName} ${newEmployee.data.employee.lastName} created successfully`
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create employee");
    },
  });
}

export function useInviteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteEmployeeInput) => {
      const response = await apiClient.post<{ message: string }>(
        "/employees/invite",
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success(`Invitation sent to ${variables.email}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/employees/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Employee deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });
}

export function useSendEmployeeInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      sendEmail = true,
    }: {
      id: string;
      sendEmail?: boolean;
    }) => {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          user: {
            id: string;
            email: string;
            role: string;
          };
        };
      }>(`/employees/${id}/invite`, { sendEmail });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_DETAILS_QUERY_KEY(id),
      });
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Invitation sent successfully");
    },
    onError: (error: ApiError) => {
      if (error.message?.includes("already has a user account")) {
        toast.error("This employee already has an account");
      } else {
        toast.error(error.message || "Failed to send invitation");
      }
    },
  });
}
