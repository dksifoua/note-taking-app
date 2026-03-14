import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import type { HttpContext } from "../src"
import { HttpApplication } from "../src"

async function okHandler(_: HttpContext): Promise<Response> {
    return new Response("ok", { status: 200 })
}

const mockScope = {
    resolve: () => {
        throw new Error("Not implemented")
    },
    dispose: (): void => {
    },
    isDisposed: (): boolean => false,
    getOrCreateInstance: () => {
        throw new Error("Not implemented")
    },
}

const mockProvider = {
    resolve: () => {
        throw new Error("Not implemented")
    },
    dispose: (): void => {
    },
    isDisposed: (): boolean => false,
    createScope: () => mockScope,
}

describe("HttpApplication", (): void => {
    let app: HttpApplication

    beforeEach((): void => {
        app = new HttpApplication(mockProvider as any)
    })

    afterEach((): void => {
        try {
            app.shutdown()
        } catch {
        }
    })

    describe("listen / shutdown", (): void => {
        it("should start the server on the given port", (): void => {
            app.listen(3001)
            expect(app["server"]).not.toBeNull()
        })

        it("should stop the server on shutdown", (): void => {
            app.listen(3002)
            app.shutdown()
            expect(app["server"]).toBeNull()
        })

        it("should throw when shutting down a server that is not running", (): void => {
            expect(() => app.shutdown()).toThrow("Server is not running.")
        })

        it("should use default port when none is provided", (): void => {
            app.listen()
            expect(app["server"]).not.toBeNull()
        })
    })

    describe("routing", (): void => {
        it("should register and handle a GET route", async (): Promise<void> => {
            app.get("/test", async (_: HttpContext): Promise<Response> =>
                new Response("get", { status: 200 })
            )
            app.listen(3010)
            const response = await fetch("http://localhost:3010/test")
            expect(response.status).toBe(200)
            expect(await response.text()).toBe("get")
        })

        it("should register and handle a POST route", async (): Promise<void> => {
            app.post("/test", async (_: HttpContext): Promise<Response> =>
                new Response("post", { status: 201 })
            )
            app.listen(3011)
            const response = await fetch("http://localhost:3011/test", { method: "POST" })
            expect(response.status).toBe(201)
        })

        it("should register and handle a PUT route", async (): Promise<void> => {
            app.put("/test/:id", okHandler)
            app.listen(3012)
            const response = await fetch("http://localhost:3012/test/1", { method: "PUT" })
            expect(response.status).toBe(200)
        })

        it("should register and handle a PATCH route", async (): Promise<void> => {
            app.patch("/test/:id", okHandler)
            app.listen(3013)
            const response = await fetch("http://localhost:3013/test/1", { method: "PATCH" })
            expect(response.status).toBe(200)
        })

        it("should register and handle a DELETE route", async (): Promise<void> => {
            app.delete("/test/:id", okHandler)
            app.listen(3014)
            const response = await fetch("http://localhost:3014/test/1", { method: "DELETE" })
            expect(response.status).toBe(200)
        })

        it("should return 404 for unregistered routes", async (): Promise<void> => {
            app.listen(3015)
            const response = await fetch("http://localhost:3015/unknown")
            expect(response.status).toBe(404)
        })

        it("should support method chaining for route registration", (): void => {
            expect(() => {
                app.get("/a", okHandler)
                    .post("/b", okHandler)
                    .put("/c/:id", okHandler)
                    .patch("/d/:id", okHandler)
                    .delete("/e/:id", okHandler)
            }).not.toThrow()
        })
    })

    describe("mount", (): void => {
        it("should mount a sub-router and handle its routes", async (): Promise<void> => {
            const { HttpRouter } = await import("../src")
            const sub = new HttpRouter()
            sub.get("/", async (_: HttpContext): Promise<Response> =>
                new Response("mounted", { status: 200 })
            )

            app.mount("/users", sub)
            app.listen(3020)

            const response = await fetch("http://localhost:3020/users")
            expect(response.status).toBe(200)
            expect(await response.text()).toBe("mounted")
        })

        it("should support method chaining on mount", (): void => {
            const { HttpRouter } = require("../src")
            const sub = new HttpRouter()
            expect(app.mount("/users", sub)).toBe(app)
        })
    })

    describe("middleware", (): void => {
        it("should apply middleware before the handler", async (): Promise<void> => {
            const order: string[] = []

            app.use({
                apply: async (ctx: HttpContext, next): Promise<Response> => {
                    order.push("middleware")
                    return next(ctx)
                }
            })

            app.get("/test", async (_: HttpContext): Promise<Response> => {
                order.push("handler")
                return new Response("ok")
            })

            app.listen(3030)
            await fetch("http://localhost:3030/test")
            expect(order).toEqual(["middleware", "handler"])
        })

        it("should apply multiple middlewares in order", async (): Promise<void> => {
            const order: string[] = []

            app.use({
                apply: async (ctx, next) => {
                    order.push("first")
                    return next(ctx)
                }
            })
            app.use({
                apply: async (ctx, next) => {
                    order.push("second")
                    return next(ctx)
                }
            })
            app.get("/test", async (_): Promise<Response> => {
                order.push("handler")
                return new Response("ok")
            })

            app.listen(3031)
            await fetch("http://localhost:3031/test")
            expect(order).toEqual(["first", "second", "handler"])
        })

        it("should allow middleware to short-circuit the chain", async (): Promise<void> => {
            app.use({
                apply: async (_ctx: HttpContext, _next): Promise<Response> =>
                    new Response("blocked", { status: 401 })
            })

            app.get("/test", okHandler)
            app.listen(3032)

            const response = await fetch("http://localhost:3032/test")
            expect(response.status).toBe(401)
            expect(await response.text()).toBe("blocked")
        })

        it("should allow middleware to modify the response", async (): Promise<void> => {
            app.use({
                apply: async (ctx: HttpContext, next): Promise<Response> => {
                    const response = await next(ctx)
                    return new Response(response.body, {
                        status: response.status,
                        headers: { ...Object.fromEntries(response.headers), "x-custom": "true" }
                    })
                }
            })

            app.get("/test", okHandler)
            app.listen(3033)

            const response = await fetch("http://localhost:3033/test")
            expect(response.headers.get("x-custom")).toBe("true")
        })

        it("should support method chaining on use", (): void => {
            expect(app.use({ apply: async (ctx, next) => next(ctx) })).toBe(app)
        })
    })

    describe("error handling", (): void => {
        it("should return 500 by default when a handler throws", async (): Promise<void> => {
            app.get("/boom", async (): Promise<Response> => {
                throw new Error("Something went wrong")
            })
            app.listen(3040)

            const response = await fetch("http://localhost:3040/boom")
            expect(response.status).toBe(500)
        })

        it("should use custom error handler when registered", async (): Promise<void> => {
            app.onError((): Response =>
                new Response("custom error", { status: 503 })
            )
            app.get("/boom", async (): Promise<Response> => {
                throw new Error("Something went wrong")
            })
            app.listen(3041)

            const response = await fetch("http://localhost:3041/boom")
            expect(response.status).toBe(503)
            expect(await response.text()).toBe("custom error")
        })

        it("should pass the error and context to the error handler", async (): Promise<void> => {
            let receivedError: unknown
            let receivedContext: HttpContext | undefined

            app.onError((error: unknown, context: HttpContext): Response => {
                receivedError = error
                receivedContext = context
                return new Response("error", { status: 500 })
            })

            app.get("/boom", async (): Promise<Response> => {
                throw new Error("boom")
            })

            app.listen(3042)
            await fetch("http://localhost:3042/boom")

            expect(receivedError).toBeInstanceOf(Error)
            expect((receivedError as Error).message).toBe("boom")
            expect(receivedContext).toBeDefined()
        })

        it("should support method chaining on onError", (): void => {
            expect(app.onError(() => new Response("error", { status: 500 }))).toBe(app)
        })

        it("should dispose the scope even when the handler throws", async (): Promise<void> => {
            let disposed = false
            const provider = {
                ...mockProvider,
                createScope: () => ({
                    ...mockScope,
                    dispose: (): void => {
                        disposed = true
                    }
                })
            }

            const testApp = new HttpApplication(provider as any)
            testApp.get("/boom", async (): Promise<Response> => {
                throw new Error("boom")
            })
            testApp.listen(3043)

            await fetch("http://localhost:3043/boom")
            expect(disposed).toBe(true)

            try {
                testApp.shutdown()
            } catch {
            }
        })
    })
})