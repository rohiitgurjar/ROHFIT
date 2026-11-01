import { Response, Request, NextFunction } from "express";
import { success, ZodSchema } from "zod";
import { Schema } from "zod/v3"

export const validate = (schema: ZodSchema) => {
    return (req:Request , res:Response, next:NextFunction) => {
        const result = schema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Failed",
                errors: result.error.issues
            });
        }

        next();
    };
};
