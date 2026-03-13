import type { HttpHandler, IHttpMiddleware } from "../types"

export class ErrorMiddleware implements IHttpMiddleware {

    public async apply(request: Request, next: HttpHandler): Promise<Response> {
        try {
            return await next(request)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Internal Server Error"
            // console.error(`\x1b[31m[error]\x1b[0m ${message}`)
            
            return Response.json({ error: message }, { status: 500 })
        }
    }
}