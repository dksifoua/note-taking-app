import type { Server } from "bun"
import { DefaultHandler } from "./handlers/default.hander"
import { ServiceCollection } from "ioc/src/collection"
import { getHandleRequestFn } from "./handlers/hendler"

const services = new ServiceCollection()
services.addScoped(DefaultHandler)

const provider = services.build()

const handleRequest = getHandleRequestFn(provider)

const server: Server<undefined> = Bun.serve({
    port: Bun.env.PORT || 3000,
    routes: {
        "/api/version": (): Promise<Response> => handleRequest(DefaultHandler, handler => handler.version())
        // "/api/auth/register": {},
        // "/api/auth/login": {},
        // "/api/auth/logout": {},
        // "/api/users/me": {},
    },
    fetch: (): Promise<Response> => handleRequest(DefaultHandler, handler => handler.home())
})

console.log(`Note Taking API is listening on ${server.url}`)