import type { HttpContext, HttpHandler, IHttpMiddleware } from "@shared/http"
import { Logger } from "@shared/logging"
import { Injectable } from "@shared/ioc"

const reset = "\x1b[0m"
const dim = "\x1b[2m"

const statusColors: Record<string, string> = {
    success: Bun.color("green", "ansi")!,
    redirect: Bun.color("cyan", "ansi")!,
    clientError: Bun.color("yellow", "ansi")!,
    serverError: Bun.color("red", "ansi")!,
}

function getStatusColor(status: number): string {
    if (status >= 500) return statusColors["serverError"]!
    if (status >= 400) return statusColors["clientError"]!
    if (status >= 300) return statusColors["redirect"]!
    return statusColors["success"]!
}

@Injectable()
export class LoggingMiddleware implements IHttpMiddleware {
    private readonly logger: Logger

    public constructor(logger: Logger) {
        this.logger = logger
    }

    public async apply(context: HttpContext, next: HttpHandler): Promise<Response> {
        const start = performance.now()
        const response = await next(context)
        const milliseconds = (performance.now() - start).toFixed(2)

        const method = context.request.method.padEnd(6)
        const url = new URL(context.request.url).pathname
        const status = response.status
        const color = getStatusColor(status)

        this.logger.info(`${color}${method}${reset} ${url} → ${color}${status}${reset} ${dim}${milliseconds}ms${reset}`)

        return response
    }
}