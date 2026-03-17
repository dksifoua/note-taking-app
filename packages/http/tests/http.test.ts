import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { HttpApplication, type HttpContext, HttpError, type HttpHandler, HttpRouter } from "../src"
import { mockLogger, mockProvider, mockScope, okHandler } from "./utils"
import { ServerNotRunningError } from "../src/errors"


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
            expect(() => app.shutdown()).toThrow(ServerNotRunningError)
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
                apply: async (ctx: HttpContext, next: HttpHandler) => {
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
                apply: async (ctx: HttpContext, next: HttpHandler) => {
                    order.push("first")
                    return next(ctx)
                }
            })
            app.use({
                apply: async (ctx: HttpContext, next: HttpHandler) => {
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
                apply: async (ctx: HttpContext, next: HttpHandler): Promise<Response> => {
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
            expect(app.use({ apply: async (ctx: HttpContext, next: HttpHandler) => next(ctx) })).toBe(app)
        })
    })

    describe("error handling", (): void => {

        it("should return 500 when handler throws a generic error", async (): Promise<void> => {
            app.get("/boom", async (): Promise<Response> => { throw new Error("Something went wrong") })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/boom`)
            expect(response.status).toBe(500)
            const body = await response.json() as { error: string }
            expect(body.error).toBe("Something went wrong")
        })

        it("should return correct status when handler throws HttpError", async (): Promise<void> => {
            app.get("/unauthorized", async (): Promise<Response> => {
                throw new HttpError({ status: 401, body: { error: "Unauthorized" } })
            })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/unauthorized`)
            expect(response.status).toBe(401)
            const body = await response.json() as { error: string }
            expect(body.error).toBe("Unauthorized")
        })

        it("should return 404 when route is not found", async (): Promise<void> => {
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/unknown`)
            expect(response.status).toBe(404)
        })

        it("should return 500 with generic message when non-Error is thrown", async (): Promise<void> => {
            app.get("/boom", async (): Promise<Response> => { throw "string error" })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/boom`)
            expect(response.status).toBe(500)
            const body = await response.json() as { error: string }
            expect(body.error).toBe("Internal Server Error")
        })

        it("should return HttpError response with correct headers", async (): Promise<void> => {
            app.get("/redirect", async (): Promise<Response> => {
                throw new HttpError({ status: 302, headers: { location: "/login" } })
            })
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/redirect`, { redirect: "manual" })
            expect(response.status).toBe(302)
            expect(response.headers.get("location")).toBe("/login")
        })

        it("should handle HttpError thrown from middleware", async (): Promise<void> => {
            app.use({
                apply: async (): Promise<Response> => {
                    throw new HttpError({ status: 403, body: { error: "Forbidden" } })
                }
            })
            app.get("/test", async (): Promise<Response> => new Response("ok"))
            app.listen(0)
            const port = (app["server"] as Bun.Server<any>).port!
            const response = await fetch(`http://localhost:${port}/test`)
            expect(response.status).toBe(403)
            const body = await response.json() as { error: string }
            expect(body.error).toBe("Forbidden")
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