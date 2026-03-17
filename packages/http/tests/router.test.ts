import { beforeEach, describe, expect, it } from "bun:test"
import { type HttpContext, HttpRouter, RouteNotFoundHttpError } from "../src"
import { makeRequest, mockScope, okHandler } from "./utils"

describe("HttpRouter", (): void => {
    let router: HttpRouter

    beforeEach((): void => {
        router = new HttpRouter()
    })

    describe("route registration", (): void => {
        
        it("should register a GET route", (): void => {
            router.get("/users", okHandler)
            expect(router.routes).toHaveLength(1)
            expect(router.routes[0]!.method).toBe("GET")
            expect(router.routes[0]!.pathname).toBe("/users")
        })

        it("should register a POST route", (): void => {
            router.post("/users", okHandler)
            expect(router.routes).toHaveLength(1)
            expect(router.routes[0]!.method).toBe("POST")
            expect(router.routes[0]!.pathname).toBe("/users")
        })

        it("should register a PUT route", (): void => {
            router.put("/users/:id", okHandler)
            expect(router.routes).toHaveLength(1)
            expect(router.routes[0]!.method).toBe("PUT")
            expect(router.routes[0]!.pathname).toBe("/users/:id")
        })

        it("should register a PATCH route", (): void => {
            router.patch("/users/:id", okHandler)
            expect(router.routes).toHaveLength(1)
            expect(router.routes[0]!.method).toBe("PATCH")
            expect(router.routes[0]!.pathname).toBe("/users/:id")
        })

        it("should register a DELETE route", (): void => {
            router.delete("/users/:id", okHandler)
            expect(router.routes).toHaveLength(1)
            expect(router.routes[0]!.method).toBe("DELETE")
            expect(router.routes[0]!.pathname).toBe("/users/:id")
        })

        it("should support method chaining", (): void => {
            router
                .get("/users", okHandler)
                .post("/users", okHandler)
                .delete("/users/:id", okHandler)
            expect(router.routes).toHaveLength(3)
        })

        it("should compile param names from pathname", (): void => {
            router.get("/users/:id/posts/:postId", okHandler)
            expect(router.routes[0]!.paramNames).toEqual(["id", "postId"])
        })
    })

    describe("handle", (): void => {
        
        it("should match and call the correct handler", async (): Promise<void> => {
            router.get("/users", async (): Promise<Response> =>
                new Response("users list", { status: 200 })
            )
            const response = await router.handle(makeRequest("GET", "/users"), mockScope)
            expect(response.status).toBe(200)
            expect(await response.text()).toBe("users list")
        })
        
        it("should throw HttpRouteNotFoundError when no route matches", (): void => {
            expect(() => router.handle(makeRequest("GET", "/unknown"), mockScope))
                .toThrow(RouteNotFoundHttpError)
        })

        it("should throw HttpRouteNotFoundError when method does not match", (): void => {
            router.get("/users", okHandler)
            expect(() => router.handle(makeRequest("POST", "/users"), mockScope))
                .toThrow(RouteNotFoundHttpError)
        })

        it("should extract route params and pass them to the handler", async (): Promise<void> => {
            router.get("/users/:id", async (ctx: HttpContext): Promise<Response> =>
                new Response(ctx.params.id, { status: 200 })
            )
            const response = await router.handle(makeRequest("GET", "/users/42"), mockScope)
            expect(await response.text()).toBe("42")
        })

        it("should extract multiple route params", async (): Promise<void> => {
            router.get("/users/:userId/posts/:postId", async (ctx: HttpContext): Promise<Response> =>
                Response.json({ userId: ctx.params.userId, postId: ctx.params.postId })
            )
            const response = await router.handle(makeRequest("GET", "/users/1/posts/2"), mockScope)
            const body = await response.json()
            expect(body).toEqual({ userId: "1", postId: "2" })
        })

        it("should pass scope to the handler context", async (): Promise<void> => {
            let receivedScope: any
            router.get("/test", async (ctx: HttpContext): Promise<Response> => {
                receivedScope = ctx.scope
                return new Response("ok")
            })
            await router.handle(makeRequest("GET", "/test"), mockScope)
            expect(receivedScope).toBe(mockScope)
        })

        it("should pass request to the handler context", async (): Promise<void> => {
            let receivedRequest: Request | undefined
            router.get("/test", async (ctx: HttpContext): Promise<Response> => {
                receivedRequest = ctx.request
                return new Response("ok")
            })
            const request = makeRequest("GET", "/test")
            await router.handle(request, mockScope)
            expect(receivedRequest).toBe(request)
        })

        it("should rethrow non-routing errors from handlers", async (): Promise<void> => {
            router.get("/boom", async (): Promise<Response> => {
                throw new Error("Something went wrong")
            })
            expect(router.handle(makeRequest("GET", "/boom"), mockScope))
                .rejects.toThrow("Something went wrong")
        })

        it("should tolerate trailing slashes on request URL", async (): Promise<void> => {
            router.get("/users", okHandler)
            const response = await router.handle(makeRequest("GET", "/users/"), mockScope)
            expect(response.status).toBe(200)
        })
    })

    describe("mount", (): void => {
        
        it("should mount a sub-router with a prefix", (): void => {
            const sub = new HttpRouter()
            sub.get("/", okHandler)
            sub.post("/:id", okHandler)
            router.mount("/users", sub)
            expect(router.routes).toHaveLength(2)
            expect(router.routes[0]!.pathname).toBe("/users")
            expect(router.routes[1]!.pathname).toBe("/users/:id")
        })

        it("should match routes from a mounted sub-router", async (): Promise<void> => {
            const sub = new HttpRouter()
            sub.get("/", async (): Promise<Response> => new Response("mounted", { status: 200 }))
            router.mount("/users", sub)
            const response = await router.handle(makeRequest("GET", "/users"), mockScope)
            expect(response.status).toBe(200)
            expect(await response.text()).toBe("mounted")
        })

        it("should tolerate trailing slash on mount prefix", (): void => {
            const sub = new HttpRouter()
            sub.get("/", okHandler)
            router.mount("/users/", sub)
            expect(router.routes[0]!.pathname).toBe("/users")
        })

        it("should handle params in mounted sub-router routes", async (): Promise<void> => {
            const sub = new HttpRouter()
            sub.get("/:id", async (ctx: HttpContext): Promise<Response> => new Response(ctx.params.id))
            router.mount("/users", sub)
            const response = await router.handle(makeRequest("GET", "/users/99"), mockScope)
            expect(await response.text()).toBe("99")
        })

        it("should allow mounting multiple sub-routers", (): void => {
            const users = new HttpRouter()
            users.get("/", okHandler)
            const posts = new HttpRouter()
            posts.get("/", okHandler)
            router.mount("/users", users)
            router.mount("/posts", posts)
            expect(router.routes).toHaveLength(2)
            expect(router.routes[0]!.pathname).toBe("/users")
            expect(router.routes[1]!.pathname).toBe("/posts")
        })
    })
})