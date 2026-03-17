import { describe, expect, it } from "bun:test"
import { HttpError, RouteNotFoundHttpError } from "../src"

describe("HttpError", (): void => {
    
    describe("constructor", (): void => {
        
        it("should set status", (): void => {
            const error = new HttpError({ status: 400 })
            expect(error.status).toBe(400)
        })

        it("should set body", (): void => {
            const error = new HttpError({ status: 400, body: { error: "Bad Request" } })
            expect(error.body).toEqual({ error: "Bad Request" })
        })

        it("should set headers", (): void => {
            const error = new HttpError({ status: 302, headers: { location: "/login" } })
            expect(error.headers).toEqual({ location: "/login" })
        })

        it("should default headers to empty object", (): void => {
            const error = new HttpError({ status: 400 })
            expect(error.headers).toEqual({})
        })

        it("should default body to undefined", (): void => {
            const error = new HttpError({ status: 400 })
            expect(error.body).toBeUndefined()
        })

        it("should set message to body when body is a string", (): void => {
            const error = new HttpError({ status: 400, body: "Bad Request" })
            expect(error.message).toBe("Bad Request")
        })

        it("should set message to 'HTTP Error' when body is not a string", (): void => {
            const error = new HttpError({ status: 400, body: { error: "Bad Request" } })
            expect(error.message).toBe("HTTP Error")
        })

        it("should be an instance of Error", (): void => {
            const error = new HttpError({ status: 400 })
            expect(error).toBeInstanceOf(Error)
        })
    })

    describe("toResponse", (): void => {
        
        it("should return a response with the correct status", async (): Promise<void> => {
            const error = new HttpError({ status: 400, body: { error: "Bad Request" } })
            const response = error.toResponse()
            expect(response.status).toBe(400)
        })

        it("should return a JSON response when body is an object", async (): Promise<void> => {
            const error = new HttpError({ status: 400, body: { error: "Bad Request" } })
            const response = error.toResponse()
            const body = await response.json()
            expect(body).toEqual({ error: "Bad Request" })
        })

        it("should return a text response when body is a string", async (): Promise<void> => {
            const error = new HttpError({ status: 400, body: "Bad Request" })
            const response = error.toResponse()
            expect(await response.text()).toBe("Bad Request")
        })

        it("should return a response with correct headers", async (): Promise<void> => {
            const error = new HttpError({ status: 302, headers: { location: "/login" } })
            const response = error.toResponse()
            expect(response.headers.get("location")).toBe("/login")
        })

        it("should return an empty body response when body is undefined", async (): Promise<void> => {
            const error = new HttpError({ status: 204 })
            const response = error.toResponse()
            expect(response.status).toBe(204)
        })

        it("should return a JSON response when body is an array", async (): Promise<void> => {
            const error = new HttpError({ status: 400, body: ["error1", "error2"] })
            const response = error.toResponse()
            const body = await response.json()
            expect(body).toEqual(["error1", "error2"])
        })
    })
})

describe("RouteNotFoundHttpError", (): void => {
    
    it("should set status to 404", (): void => {
        const request = new Request("http://localhost/users", { method: "GET" })
        const error = new RouteNotFoundHttpError(request)
        expect(error.status).toBe(404)
    })

    it("should include method and pathname in body", async (): Promise<void> => {
        const request = new Request("http://localhost/users", { method: "GET" })
        const error = new RouteNotFoundHttpError(request)
        const response = error.toResponse()
        const body = await response.json() as { error: string }
        expect(body.error).toContain("GET")
        expect(body.error).toContain("/users")
    })

    it("should be an instance of HttpError", (): void => {
        const request = new Request("http://localhost/users", { method: "GET" })
        const error = new RouteNotFoundHttpError(request)
        expect(error).toBeInstanceOf(HttpError)
    })

    it("should normalise trailing slash in pathname", async (): Promise<void> => {
        const request = new Request("http://localhost/users/", { method: "GET" })
        const error = new RouteNotFoundHttpError(request)
        const response = error.toResponse()
        const body = await response.json() as { error: string }
        expect(body.error).toContain("/users")
        expect(body.error).not.toContain("/users/")
    })

    it("should handle root pathname", async (): Promise<void> => {
        const request = new Request("http://localhost/", { method: "GET" })
        const error = new RouteNotFoundHttpError(request)
        const response = error.toResponse()
        const body = await response.json() as { error: string }
        expect(body.error).toContain("/")
    })
})