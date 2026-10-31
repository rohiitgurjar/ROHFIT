import {Request, Response, NextFunction} from "express";
import { AppError } from "../utils/AppError";


export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.message);

    const statusCode =
        err instanceof AppError ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};