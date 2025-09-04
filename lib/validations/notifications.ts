import { z } from 'zod';

// Polling endpoint query parameters validation
export const pollingQuerySchema = z.object({
  since: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Since must be a valid ISO date string'),
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 50)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
});

// Notification filters validation
export const notificationFiltersSchema = z.object({
  type: z.enum(['INVITE', 'DOCUMENT', 'ALERT', 'REMINDER', 'INFO']).optional(),
  unreadOnly: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  since: z.date().optional(),
});

export type PollingQueryParams = z.infer<typeof pollingQuerySchema>;
export type NotificationFiltersInput = z.infer<typeof notificationFiltersSchema>;