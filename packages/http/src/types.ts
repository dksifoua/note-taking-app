import type { IServiceProvider, ServiceIdentifier } from "@shared/ioc"

export type MayBePromise<T> = T | Promise<T>

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export type HttpHandler = (context: HttpContext) => MayBePromise<Response>

export type HttpRouteDefinition = {
    method: HttpMethod
    pathname: string
    handlerFn: HttpHandler
}

export type HttpCompiledRoute = HttpRouteDefinition & {
    regexPattern: RegExp
    paramNames: string[]
}

export type HttpRouteParams = Record<string, string>

export type HttpContext = {
    request: Request
    params: HttpRouteParams
    scope: IServiceProvider
    body?: unknown
}

export interface IHttpMiddleware {
    apply: (context: HttpContext, next: HttpHandler) => MayBePromise<Response>
}

export interface IHttpRouter {
    readonly routes: HttpCompiledRoute[]
    
    mount(prefix: string, router: IHttpRouter): IHttpRouter
    handle(request: Request, scope: IServiceProvider): MayBePromise<Response>
    
    get(pathname: string, handler: HttpHandler): IHttpRouter
    post(pathname: string, handler: HttpHandler): IHttpRouter
    put(pathname: string, handler: HttpHandler): IHttpRouter
    patch(pathname: string, handler: HttpHandler): IHttpRouter
    delete(pathname: string, handler: HttpHandler): IHttpRouter
}

export interface IHttpApplication {
    listen(port?: number): void
    shutdown(): void

    use(middleware: IHttpMiddleware | ServiceIdentifier<IHttpMiddleware>): IHttpApplication
    mount(prefix: string, router: IHttpRouter): IHttpApplication

    get(pathname: string, handler: HttpHandler): IHttpApplication
    post(pathname: string, handler: HttpHandler): IHttpApplication
    put(pathname: string, handler: HttpHandler): IHttpApplication
    patch(pathname: string, handler: HttpHandler): IHttpApplication
    delete(pathname: string, handler: HttpHandler): IHttpApplication
}