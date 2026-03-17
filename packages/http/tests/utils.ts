import { type HttpContext } from "../src"
import { type IServiceProvider, ScopeProvider } from "@shared/ioc"
import type { ILogger } from "@shared/logging"

export async function okHandler(_: HttpContext): Promise<Response> {
    return new Response("ok", { status: 200 })
}

export function makeRequest(method: string, path: string): Request {
    return new Request(`http://localhost${path}`, { method })
}

export const mockProvider: IServiceProvider = {
    resolve: () => { throw new Error("Not implemented") },
    dispose: (): void => {},
    isDisposed: (): boolean => false,
    createScope: () => mockScope as ScopeProvider,
}

export const mockScope: IServiceProvider = {
    resolve: () => {
        throw new Error("Not implemented")
    },
    dispose: (): void => {
    },
    isDisposed: (): boolean => false,
    createScope: () => mockScope as ScopeProvider,
}

export const mockLogger: ILogger = {
    debug: () => {
    },
    info: () => {
    },
    warn: () => {
    },
    error: () => {
    },
    fatal: async () => {
    },
    child: () => mockLogger,
}