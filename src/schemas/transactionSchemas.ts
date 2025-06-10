import { z } from 'zod';

export const createTransactionSchema = z.object({
    type: z
        .enum(['income', 'expense'], {
            errorMap: () => ({message: 'Type must be either "income" or "expense"'})
        }),
    
        category: z
            .string()
            .min(1, 'Category is required')
            .max(50, 'Category must not exceed 50 characters'),
        
        amount: z
            .number()
            .positive('Amount must be greater than 0')
            .max(99999999.99, 'Amount is too large'),
 
        description: z
            .string()
            .max(200, 'Description must not exceed 200 characters')
            .optional(),
            
        date: z
            .string()
            .datetime()
            .or(z.date())       
});


export const updateTransactionSchema = z.object({
    type: z
        .enum(['income', 'expense'], {
            errorMap: () => ({message: 'Type must be either "income" or "expense"'})
        })
        .optional(),
        
    
        category: z
            .string()
            .min(1, 'Category is required')
            .max(50, 'Category must not exceed 50 characters')
            .optional(),
        
        amount: z
            .number()
            .positive('Amount must be greater than 0')
            .max(99999999.99, 'Amount is too large')
            .optional(),
 
        description: z
            .string()
            .max(200, 'Description must not exceed 200 characters')
            .optional(),
            
        date: z.preprocess((val) => {
        // Handle empty strings, null, or undefined
        if (val === "" || val === null || val === undefined) {
            return undefined;
        }
        if (typeof val === 'string') {
            return new Date(val);
        }
        return val;
    }, z.date().optional())     
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;