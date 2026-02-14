export class ApiError extends Error {
    status: number;
    success = false;

    constructor(status: number, message?: string) {
        super(message);
        this.status = status;
    }
};