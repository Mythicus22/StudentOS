export class ApiResponse {
    status: number;
    success: boolean;
    message: string;
    data?: unknown;

    constructor(status: number, message: string, data?: unknown) {
        this.status = status;
        this.message = message;
        this.success = status < 400;
        this.data = data;
    }
}