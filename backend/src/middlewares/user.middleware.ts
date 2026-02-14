import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { z } from 'zod';
import jsonwebtoken from 'jsonwebtoken';
import { Types } from 'mongoose';

const usernameZodSchema = z.string().min(1).max(12).regex(/^[a-zA-Z0-9_]+$/);
const passwordZodSchema = z.string().min(8).max(20);

export const checkCredentials = (req: Request, res: Response, next: NextFunction) => {
    console.log('[MIDDLEWARE] Checking credentials');
    let { username, password } = req.body;

    if (!username || !password) {
        console.log('[MIDDLEWARE] Missing username or password');
        throw new ApiError(401, 'Please provide both username and password!');
    }

    username = username.toLowerCase();

    const validUsername = usernameZodSchema.safeParse(username);
    if (!validUsername.success) {
        console.log('[MIDDLEWARE] Invalid username format:', username);
        throw new ApiError(422, 'Invalid Username!');
    }

    const validPassword = passwordZodSchema.safeParse(password);
    if (!validPassword.success) {
        console.log('[MIDDLEWARE] Invalid password format');
        throw new ApiError(422, 'Invalid Password!');
    }

    console.log('[MIDDLEWARE] Credentials validated for user:', username);
    next();
}

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
    console.log('[MIDDLEWARE] Verifying user token');
    
    const jwt = req.cookies.token;
    
    if (!jwt) {
        console.log('[MIDDLEWARE] No token found in cookies');
        throw new ApiError(401, 'Invalid token. Please login again!');
    }

    try {
        console.log('[MIDDLEWARE] Verifying JWT token');
        const decoded = jsonwebtoken.verify(jwt, process.env.JWT_SECRET!) as jsonwebtoken.JwtPayload & {token: string};
        req.userId = new Types.ObjectId(decoded.token);
        console.log('[MIDDLEWARE] Token verified for user:', decoded.token);
        next();
    } catch (e) {
        console.log('[MIDDLEWARE] JWT verification failed:', (e as Error).message);
        throw new ApiError(401, 'Invalid token. Please login again.');
    }
}