import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { z } from 'zod';
import jsonwebtoken from 'jsonwebtoken';
import { Types } from 'mongoose';

const usernameZodSchema = z.string().min(1).max(12).regex(/^[a-zA-Z0-9_]+$/);
const passwordZodSchema = z.string().min(8).max(20);

export const checkCredentials = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(401, 'Please provide both username and password!');
    }

    username = username.toLowerCase();

    const validUsername = usernameZodSchema.safeParse(username);
    if (!validUsername.success) throw new ApiError(422, 'Invalid Username!');

    const validPassword = passwordZodSchema.safeParse(password);
    if (!validPassword.success) throw new ApiError(422, 'Invalid Password!');

    next();
}

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
    const jwt = req.cookies.token;
    
    if (!jwt) throw new ApiError(401, 'Invalid token. Please login again!');

    try {
        const decoded = jsonwebtoken.verify(jwt, process.env.JWT_SECRET!) as jsonwebtoken.JwtPayload & {token: string};
        req.userId = new Types.ObjectId(decoded.token);
        next();
    } catch (e) {
        console.warn('[AUTH] JWT verification failed:', (e as Error).message);
        throw new ApiError(401, 'Invalid token. Please login again.');
    }
}