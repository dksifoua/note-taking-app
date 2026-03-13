import type { HttpHandler, IHttpMiddleware } from "../types"

export class LoggingMiddleware implements IHttpMiddleware {
    
    public async apply(request: Request, next: HttpHandler): Promise<Response> {
        const start = performance.now()
        const response = await next(request)
        const end = performance.now()

        const milliseconds = (end - start).toFixed(2)

        const method = request.method.padEnd(6)
        const url = new URL(request.url).pathname
        const status = response.status
        
        let color: string
        switch (true) {
            case status >= 500:
                color = "\x1b[31m" // red
                break
            case status >= 400:
                color = "\x1b[33m" // yellow
                break
            case status >= 300:
                color = "\x1b[36m" // cyan
                break
            default:
                color = "\x1b[32m" // green
        }

        console.log(`${color}${method}\x1b[0m ${url} → ${color}${status}\x1b[0m  \x1b[2m${milliseconds}ms\x1b[0m`)
        
        return response
    }
}