export class HttpError extends Error {
    public readonly status: number
    public readonly headers: Record<string, string>
    public readonly body: unknown

    public constructor({ status, headers, body }: { status: number, headers?: Record<string, string>, body?: unknown }) {
        super(typeof body === "string" ? body : "HTTP Error")
        this.status = status
        this.headers = headers ?? {}
        this.body = body
    }

    public toResponse(): Response {
        const isJson = typeof this.body === "object" && this.body !== null
        return isJson
            ? Response.json(this.body, { status: this.status, headers: this.headers })
            : new Response(this.body as string ?? null, { status: this.status, headers: this.headers })
    }
}

export class RouteNotFoundHttpError extends HttpError {

    public constructor(request: Request) {
        const method = request.method
        const pathname = new URL(request.url).pathname.replace(/\/$/, "") || "/"

        super({ body: { error: `Route [${method} ${pathname}] not found.` }, status: 404 })
    }
}