import type { HttpHandler, HttpMethod, HttpRoute } from "./types"

export class Router {
    private readonly routes: HttpRoute[]

    public constructor() {
        this.routes = []
        
        this.handle = this.handle.bind(this)
    }

    public async handle(request: Request): Promise<Response> {
        const route = this.match(request)
        
        return route.handlerFn(request)
    }

    public get(pathname: string, handlerFn: HttpHandler): Router {
        this.route("GET", pathname, handlerFn)
        return this
    }

    public post(pathname: string, handlerFn: HttpHandler): Router {
        this.route("POST", pathname, handlerFn)
        return this
    }

    public put(pathname: string, handlerFn: HttpHandler): Router {
        this.route("PUT", pathname, handlerFn)
        return this
    }

    public patch(pathname: string, handlerFn: HttpHandler): Router {
        this.route("PATCH", pathname, handlerFn)
        return this
    }

    public delete(pathname: string, handlerFn: HttpHandler): Router {
        this.route("DELETE", pathname, handlerFn)
        return this
    }

    private route(method: HttpMethod, pathname: string, handlerFn: HttpHandler): void {
        const paramNames: string[] = []
        const pattern = pathname
            .replace(/:([a-zA-Z_]+)/g, (_: string, param: string): string => {
                paramNames.push(param)
                return "([^/]+)"
            })  
            .replace(/\//g, "\\/")

        const regexPattern = new RegExp(`^${pattern}$`)

        this.routes.push({ method, regexPattern, paramNames, handlerFn })
    }

    private match(request: Request): HttpRoute {
        const method = request.method
        const pathname = new URL(request.url).pathname.replace(/\/$/, "") || "/"
        for (const route of this.routes) {
            if (route.method === method && route.regexPattern.test(pathname)) {
                return route
            }
        }

        throw new Error(`Route [${method} ${pathname}] not found.`)
    }
}