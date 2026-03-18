import { HttpError } from "@shared/http"
import { z } from "zod"

export * from "./auth.request"

export function validate<T>(schema: z.ZodType<T>, body: unknown): T {
    const result = schema.safeParse(body)
    if (!result.success) {
        throw new HttpError({
            status: 422,
            body: { errors: z.flattenError(result.error).fieldErrors }
        })
    }
    return result.data
}

export class HttpResponse {

    public static ok(body?: unknown, headers?: Record<string, string>): Response {
        return body !== undefined
            ? Response.json(body, { status: 200, headers })
            : new Response(null, { status: 200, headers })
    }

    public static created(headers?: Record<string, string>): Response {
        return new Response(null, { status: 201, headers })
    }

    public static noContent(headers?: Record<string, string>): Response {
        return new Response(null, { status: 204, headers })
    }

    public static accepted(body?: unknown, headers?: Record<string, string>): Response {
        return body !== undefined
            ? Response.json(body, { status: 202, headers })
            : new Response(null, { status: 202, headers })
    }
}