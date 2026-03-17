import type { HttpCompiledRoute, HttpHandler, HttpMethod, HttpRouteParams, IHttpRouter } from "./types"
import { RouteNotFoundHttpError } from "./errors"
import type { IServiceProvider } from "@shared/ioc"

export class HttpRouter implements IHttpRouter {
    public readonly routes: HttpCompiledRoute[]

    public constructor() {
        this.routes = []
    }

    public mount(prefix: string, router: IHttpRouter): IHttpRouter {
        const normalisedPrefix = prefix.replace(/\/$/, "")

        for (const route of router.routes) {
            this.add(route.method, normalisedPrefix + route.pathname.replace(/\/$/, ""), route.handlerFn)
        }

        return this
    }

    public async handle(request: Request, scope: IServiceProvider): Promise<Response> {
        const { route, params } = this.match(request)
        return route.handlerFn({ request, params, scope })
    }

    public get(pathname: string, handlerFn: HttpHandler): IHttpRouter {
        this.add("GET", pathname, handlerFn)
        return this
    }

    public post(pathname: string, handlerFn: HttpHandler): IHttpRouter {
        this.add("POST", pathname, handlerFn)
        return this
    }

    public put(pathname: string, handlerFn: HttpHandler): IHttpRouter {
        this.add("PUT", pathname, handlerFn)
        return this
    }

    public patch(pathname: string, handlerFn: HttpHandler): IHttpRouter {
        this.add("PATCH", pathname, handlerFn)
        return this
    }

    public delete(pathname: string, handlerFn: HttpHandler): IHttpRouter {
        this.add("DELETE", pathname, handlerFn)
        return this
    }

    private add(method: HttpMethod, pathname: string, handlerFn: HttpHandler): void {
        const paramNames: string[] = []
        const pattern = pathname
            .replace(/:([a-zA-Z_]+)/g, (_: string, param: string): string => {
                paramNames.push(param)
                return "([^/]+)"
            })
            .replace(/\//g, "\\/")

        const regexPattern = new RegExp(`^${pattern}$`)

        this.routes.push({ method, pathname, regexPattern, paramNames, handlerFn })
    }

    private match(request: Request): { route: HttpCompiledRoute, params: HttpRouteParams } {
        const method = request.method
        const pathname = new URL(request.url).pathname.replace(/\/$/, "") || "/"

        for (const route of this.routes) {
            if (route.method !== method) continue
            const match = pathname.match(route.regexPattern)
            if (match) {
                const params = Object.fromEntries(
                    route.paramNames.map((name: string, index: number): [string, string] => [name, match[index + 1]!])
                )
                return { route, params }
            }
        }

        throw new RouteNotFoundHttpError(request)
    }
}