export class NotFoundError extends Error {
    public readonly statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";
        this.statusCode = 400;
    }
}