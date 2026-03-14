import type {
    HttpContext,
    HttpErrorHandler,
    HttpHandler,
    IHttpApplication,
    IHttpMiddleware,
    IHttpRouter,
    MayBePromise
} from "./types"
import { HttpRouter } from "./router"
import { type IServiceProvider } from "@shared/ioc"
import { type ILogger, Logger } from "@shared/logging"

export class HttpApplication implements IHttpApplication {
    private readonly router: IHttpRouter
    private readonly provider: IServiceProvider
    private readonly middlewares: IHttpMiddleware[]
    private errorHandler: HttpErrorHandler
    private server: Bun.Server<undefined> | null
    private readonly logger: ILogger

    public constructor(provider: IServiceProvider, router?: HttpRouter, logger?: ILogger) {
        this.provider = provider
        this.router = router ?? new HttpRouter()
        this.middlewares = []
        this.server = null
        this.errorHandler = (error: unknown): Response => {
            const message = error instanceof Error ? error.message : "Internal Server Error"
            return Response.json({ error: message }, { status: 500 })
        }
        this.logger = logger ?? new Logger("Http")
    }

    private async applyMiddlewares(context: HttpContext, final: HttpHandler): Promise<Response> {
        const middlewares = this.middlewares

        async function dispatch(index: number): Promise<Response> {
            const middleware = middlewares[index]
            if (middleware === undefined) {
                return Promise.resolve(final(context))
            }

            return Promise.resolve(
                middleware.apply(context, (): MayBePromise<Response> => dispatch(index + 1))
            )
        }

        return dispatch(0)
    }

    public listen(port?: number): void {
        const self = this

        this.server = Bun.serve({
            port: port,
            async fetch(request: Request): Promise<Response> {
                const scope = self.provider.createScope()
                const context: HttpContext = { request, params: {}, scope }

                try {
                    return await self.applyMiddlewares(
                        context,
                        (ctx: HttpContext): MayBePromise<Response> => self.router.handle(ctx.request, ctx.scope)
                    )
                } catch (error) {
                    return self.errorHandler(error, context)
                } finally {
                    scope.dispose()
                }
            }
        })

        this.logger.info(`Listening on ${this.server.url}`)
    }

    public shutdown(): void {
        if (this.server === null) {
            throw new Error("Server is not running.")
        }

        this.server.stop()
        this.server = null
    }

    public use(middleware: IHttpMiddleware): IHttpApplication {
        this.middlewares.push(middleware)
        return this
    }

    public mount(prefix: string, router: IHttpRouter): IHttpApplication {
        this.router.mount(prefix, router)
        return this
    }

    public onError(handler: HttpErrorHandler): IHttpApplication {
        this.errorHandler = handler
        return this
    }

    public get(pathname: string, handler: HttpHandler): IHttpApplication {
        this.router.get(pathname, handler)
        return this
    }

    public post(pathname: string, handler: HttpHandler): IHttpApplication {
        this.router.post(pathname, handler)
        return this
    }

    public put(pathname: string, handler: HttpHandler): IHttpApplication {
        this.router.put(pathname, handler)
        return this
    }

    public patch(pathname: string, handler: HttpHandler): IHttpApplication {
        this.router.patch(pathname, handler)
        return this
    }

    public delete(pathname: string, handler: HttpHandler): IHttpApplication {
        this.router.delete(pathname, handler)
        return this
    }
}