import { Response, Request, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validateData = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = schema.parse(req.body)
            req.body = validatedData
            next()
        } catch (error) {
            if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
        
            res.status(400).json({
            error: 'Validation failed',
            details: errorMessages
            });
            return;
            }

            res.status(500).json({
                error: 'Internal server error during validation'
            });
            return;
        }
    }
}

export const validateRegistration = validateData;
export const validateLogin = validateData;
