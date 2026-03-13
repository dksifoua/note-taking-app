import { Router } from "./router"
import type { HttpHandler, IHttpMiddleware, MayBePromise } from "./types"

export class Http {
    private readonly router: Router
    private readonly middlewares: IHttpMiddleware[]

    public constructor(router?: Router) {
        this.router = router ?? new Router()
        this.middlewares = []
    }

    public use(middleware: IHttpMiddleware): Http {
        this.middlewares.push(middleware)
        return this
    }

    public async applyMiddlewares(request: Request, final: HttpHandler): Promise<Response> {
        const middlewares = this.middlewares

        async function dispatch(request: Request, index: number): Promise<Response> {
            const middleware = middlewares[index]
            if (middleware === undefined) {
                return final(request)
            }

            return middleware.apply(request, (nextRequest: Request): MayBePromise<Response> => dispatch(nextRequest, index + 1))
        }

        return dispatch(request, 0)
    }

    public listen(port?: number): void {
        const self = this

        const server = Bun.serve({
            port: port ?? Bun.env.PORT ?? 3000,
            async fetch(request: Request): Promise<Response> {
                return self.applyMiddlewares(request, self.router.handle)
            },
            async error(error: Error): Promise<Response> {
                const message = error.message || "Internal Server Error"
                return Response.json({ error: message }, { status: 500 })
            }
        })

        console.log(`Listening on ${server.url}`)
    }

    public get(pathname: string, handler: HttpHandler): Http {
        this.router.get(pathname, handler)
        return this
    }

    public post(pathname: string, handler: HttpHandler): Http {
        this.router.post(pathname, handler)
        return this
    }

    public put(pathname: string, handler: HttpHandler): Http {
        this.router.put(pathname, handler)
        return this
    }

    public patch(pathname: string, handler: HttpHandler): Http {
        this.router.patch(pathname, handler)
        return this
    }

    public delete(pathname: string, handler: HttpHandler): Http {
        this.router.delete(pathname, handler)
        return this
    }
}