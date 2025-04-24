

export {};

declare global {
    namespace Express {
        interface Request {
            correlationId?: string,
            user?: {
                userId: string,
                role: string,
                avatar: string
            }
        }
    }
}