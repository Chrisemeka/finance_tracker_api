import { z } from 'zod';

export const createBudgetSchema = z.object({
    category: z
        .string()
        .toLowerCase()
        .min(1, 'Category is required')
        .max(50, 'Category must not exceed 50 characters'),
    amount: z
        .number()
        .positive('Amount must be greater than 0')
        .max(99999999.99, 'Amount is too large'),
    month: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
        .transform((val) => new Date(`${val}-01T00:00:00.000Z`)),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;