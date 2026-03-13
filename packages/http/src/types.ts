export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export type MayBePromise<T> = T | Promise<T>

export type HttpHandler = (request: Request) => MayBePromise<Response>

export interface IHttpMiddleware {
    apply: (request: Request, next: HttpHandler) => MayBePromise<Response>
}

export type HttpRoute = {
    method: HttpMethod
    regexPattern: RegExp
    paramNames: string[]
    handlerFn: HttpHandler
}