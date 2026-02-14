import type { RequestHandler } from "express";

export const asyncHandler = function (fn: RequestHandler): RequestHandler {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    }
};