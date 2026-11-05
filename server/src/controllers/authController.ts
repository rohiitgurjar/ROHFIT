
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import pool from "../db";

export const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check whether email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered. Please use another email."
            });
        }

        // 2. Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // 3. Insert user into PostgreSQL
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name, email, passwordHash]
        );

        // 4. Return safe user details
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });

    } catch (error) {
        // PostgreSQL unique constraint violation
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            return res.status(409).json({
                success: false,
                message: "Email already registered. Please use another email."
            });
        }

        next(error);
    }
};
