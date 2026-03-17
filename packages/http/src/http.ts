import type { HttpContext, HttpHandler, IHttpApplication, IHttpMiddleware, IHttpRouter, MayBePromise } from "./types"
import { HttpRouter } from "./router"
import { type ILogger } from "@shared/logging"
import type { IServiceProvider, ServiceIdentifier } from "@shared/ioc"
import { HttpError, ServerNotRunningError } from "./errors"

export class HttpApplication implements IHttpApplication {
    private readonly router: IHttpRouter
    private readonly provider: IServiceProvider
    private readonly middlewares: (IHttpMiddleware | ServiceIdentifier<IHttpMiddleware>)[]
    private server: Bun.Server<undefined> | null
    private readonly logger: ILogger

    public constructor(provider: IServiceProvider, logger: ILogger) {
        this.provider = provider
        this.router = new HttpRouter()
        this.middlewares = []
        this.server = null
        this.logger = logger
    }

    private async applyMiddlewares(context: HttpContext, final: HttpHandler): Promise<Response> {
        const middlewares = this.middlewares

        async function dispatch(index: number): Promise<Response> {
            const value = middlewares[index]
            if (value === undefined) {
                return Promise.resolve(final(context))
            }

            const middleware: IHttpMiddleware = isMiddlewareInstance(value)
                ? value
                : context.scope.resolve<IHttpMiddleware>(value)

            return Promise.resolve(middleware.apply(context, (): MayBePromise<Response> => dispatch(index + 1)))
        }

        return dispatch(0)
    }

    private handleError(error: unknown): Response {
        if (error instanceof HttpError) {
            return error.toResponse()
        }
        const message = error instanceof Error ? error.message : "Internal Server Error"
        return Response.json({ error: message }, { status: 500 })
    }

    public listen(port?: number): void {
        const self = this

        // Ensure we pass a valid port only when provided; Bun.serve treats `port: undefined` as invalid in some environments.
        const serveOptions: Bun.Serve.Options<undefined> = {
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
                    return self.handleError(error)
                } finally {
                    scope.dispose()
                }
            }
        }

        this.server = Bun.serve(serveOptions)
        this.logger.info(`Listening on ${this.server.url}`)
    }

    public shutdown(): void {
        if (this.server === null) {
            throw new ServerNotRunningError()
        }

        this.server.stop()
        this.server = null
    }

    public use(middleware: IHttpMiddleware | ServiceIdentifier<IHttpMiddleware>): IHttpApplication {
        this.middlewares.push(middleware)
        return this
    }

    public mount(prefix: string, router: IHttpRouter): IHttpApplication {
        this.router.mount(prefix, router)
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

function isMiddlewareInstance(value: IHttpMiddleware | ServiceIdentifier<IHttpMiddleware>): value is IHttpMiddleware {
    return typeof value === "object" && "apply" in value
}