export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  organizationId: string;
  userId: string | null;
  hasUser: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EmployeeDetails {
  success: boolean;
  message: string;
  data: {
    employee: Employee;
  };
}

export interface AssignedDocument {
  id: string;
  documentId: string;
  documentName: string;
  assignedAt: string;
  dueDate?: string;
  status: "pending" | "completed" | "overdue";
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  dob: string; // ISO date string
}

export interface InviteEmployeeInput {
  email: string;
  role: "employee" | "admin" | "hr";
}

export interface EmployeeListResponse {
  success: boolean;
  message: string;
  data: {
    employees: Employee[];
    pagination: Pagination;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
