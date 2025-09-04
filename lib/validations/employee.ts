import { z } from 'zod';

export const roleEnum = z.enum(['employee', 'admin', 'hr']);

export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date format')
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - parsed.getFullYear();
      return age >= 16 && age <= 100;
    }, 'Employee must be between 16 and 100 years old'),
});

export const inviteEmployeeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  role: roleEnum,
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>;