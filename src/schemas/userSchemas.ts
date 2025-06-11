import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(8, 'Password must be at leasr 8 characterss long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

const emailSchema = z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()


export const registerUserSchema = z.object({
    name: z 
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

    email: emailSchema,
    password: passwordSchema
})

export const loginUserSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

export const updateUserSchema = z.object({
    name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .optional(),
  
  currencyPreference: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g., USD, EUR)')
    .toUpperCase()
    .optional(),
  
  monthlyIncome: z
    .number()
    .min(0, 'Monthly income cannot be negative')
    .optional()
    
    
})
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>