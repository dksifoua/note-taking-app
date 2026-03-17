export class HttpRouteNotFoundError extends Error {
    
    public constructor(request: Request) {
        const method = request.method
        const pathname = new URL(request.url).pathname.replace(/\/$/, "") || "/"
        
        super(`Route [${method} ${pathname}] not found.`)
    }
}

export class HttpServerNotRunningError extends Error {
    
    public constructor() {
        super("Server is not running.")
    }
}