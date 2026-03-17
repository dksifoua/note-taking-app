import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { HttpApplication, type HttpContext, HttpRouter, HttpServerNotRunningError } from "../src"
import { mockLogger, mockProvider, mockScope, okHandler } from "./utils"


describe("HttpApplication", (): void => {
    let app: HttpApplication

    beforeEach((): void => {
        app = new HttpApplication(mockProvider, mockLogger)
    })

    afterEach((): void => {
        try {
            app.shutdown()
        } catch {
        }
    })

    describe("listen / shutdown", (): void => {

        it("should start the server on the given port", (): void => {
            app.listen(0)
            expect(app["server"]).not.toBeNull()
        })

        it("should stop the server on shutdown", (): void => {
            app.listen(0)
            app.shutdown()
            expect(app["server"]).toBeNull()
        })

        it("should throw when shutting down a server that is not running", (): void => {
            expect(() => app.shutdown()).toThrow(HttpServerNotRunningError)
        })
    })

    describe("routing", (): void => {

        it("should register and handle a GET route", async (): Promise<void> => {
            app.get("/test", async (): Promise<Response> => new Response("get", { status: 200 }))
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test`)
            expect(response.status).toBe(200)
            expect(await response.text()).toBe("get")
        })

        it("should register and handle a POST route", async (): Promise<void> => {
            app.post("/test", async (): Promise<Response> => new Response("post", { status: 201 }))
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test`, { method: "POST" })
            expect(response.status).toBe(201)
        })

        it("should register and handle a PUT route", async (): Promise<void> => {
            app.put("/test/:id", okHandler)
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test/1`, { method: "PUT" })
            expect(response.status).toBe(200)
        })

        it("should register and handle a PATCH route", async (): Promise<void> => {
            app.patch("/test/:id", okHandler)
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test/1`, { method: "PATCH" })
            expect(response.status).toBe(200)
        })

        it("should register and handle a DELETE route", async (): Promise<void> => {
            app.delete("/test/:id", okHandler)
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test/1`, { method: "DELETE" })
            expect(response.status).toBe(200)
        })

        it("should return 404 for unregistered routes", async (): Promise<void> => {
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/unknown`)
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

        it("should support method chaining on mount", (): void => {
            const sub = new HttpRouter()
            expect(app.mount("/users", sub)).toBe(app)
        })

        it("should mount a sub-router and handle its routes", async (): Promise<void> => {
            const sub = new HttpRouter()
            sub.get("/", async (): Promise<Response> => new Response("mounted", { status: 200 }))
            app.mount("/users", sub)
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/users`)
            expect(response.status).toBe(200)
            expect(await response.text()).toBe("mounted")
        })
    })

    describe("middleware", (): void => {

        it("should apply middleware before the handler", async (): Promise<void> => {
            const order: string[] = []
            app.use({
                apply: async (ctx, next) => {
                    order.push("middleware")
                    return next(ctx)
                }
            })
            app.get("/test", async (): Promise<Response> => {
                order.push("handler")
                return new Response("ok")
            })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            await fetch(`http://localhost:${port}/test`)
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
            app.get("/test", async (): Promise<Response> => {
                order.push("handler")
                return new Response("ok")
            })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            await fetch(`http://localhost:${port}/test`)
            expect(order).toEqual(["first", "second", "handler"])
        })

        it("should allow middleware to short-circuit the chain", async (): Promise<void> => {
            app.use({ apply: async (): Promise<Response> => new Response("blocked", { status: 401 }) })
            app.get("/test", okHandler)
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test`)
            expect(response.status).toBe(401)
            expect(await response.text()).toBe("blocked")
        })

        it("should allow middleware to modify the response", async (): Promise<void> => {
            app.use({
                apply: async (ctx, next): Promise<Response> => {
                    const response = await next(ctx)
                    return new Response(response.body, {
                        status: response.status,
                        headers: { ...Object.fromEntries(response.headers), "x-custom": "true" }
                    })
                }
            })
            app.get("/test", okHandler)
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test`)
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
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/boom`)
            expect(response.status).toBe(500)
        })

        it("should use custom error handler when registered", async (): Promise<void> => {
            app.onError((): Response => new Response("custom error", { status: 503 }))
            app.get("/boom", async (): Promise<Response> => {
                throw new Error("boom")
            })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/boom`)
            expect(response.status).toBe(503)
            expect(await response.text()).toBe("custom error")
        })

        it("should pass the error and context to the error handler", async (): Promise<void> => {
            let receivedError: unknown
            let receivedContext: HttpContext | undefined
            app.onError((error, context): Response => {
                receivedError = error
                receivedContext = context
                return new Response("error", { status: 500 })
            })
            app.get("/boom", async (): Promise<Response> => {
                throw new Error("boom")
            })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            await fetch(`http://localhost:${port}/boom`)
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
            const testApp = new HttpApplication(provider as any, mockLogger)
            testApp.get("/boom", async (): Promise<Response> => {
                throw new Error("boom")
            })
            testApp.listen(0)
            const port = (testApp["server"] as Bun.Server<any>).port!
            await fetch(`http://localhost:${port}/boom`)
            expect(disposed).toBe(true)
            try {
                testApp.shutdown()
            } catch {
            }
        })
    })
})