export class APIError extends Error {
    statusCode?: number;
    originalError?: any;

    constructor(message: string, statusCode?: number, originalError?: any) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.originalError = originalError;

        // Fix prototype chain for ES5
        Object.setPrototypeOf(this, APIError.prototype);
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';

        // Fix prototype chain for ES5
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}