import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log('[ERROR MIDDLEWARE] Error caught:', err.message);
    console.log('[ERROR MIDDLEWARE] Stack:', err.stack);
    
    if (err instanceof ApiError) {
        console.log('[ERROR MIDDLEWARE] ApiError - Status:', err.status, 'Message:', err.message);
        return res.status(err.status).json({status: err.status, success: err.success, message: err.message});
    }
    console.log('[ERROR MIDDLEWARE] Internal server error:', err.message);
    return res.status(500).json({status: 500, success: false, message: 'Internal Server Error.'});
};