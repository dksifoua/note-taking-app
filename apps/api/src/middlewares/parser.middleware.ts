import { type HttpContext, HttpError, type HttpHandler, type IHttpMiddleware } from "@shared/http"

abstract class BodyParserMiddleware {
    protected static readonly HTTP_BODY_METHODS: Set<string> = new Set(["POST", "PUT", "PATCH"])

    protected shouldParse(context: HttpContext, contentType: string): boolean {
        return (
            !context.request.bodyUsed
            && BodyParserMiddleware.HTTP_BODY_METHODS.has(context.request.method)
            && (context.request.headers.get("content-type") ?? "").includes(contentType)
        )
    }
}

export class JsonBodyParserMiddleware extends BodyParserMiddleware implements IHttpMiddleware {

    public async apply(context: HttpContext, next: HttpHandler): Promise<Response> {
        if (this.shouldParse(context, "application/json")) {
            try {
                context.body = await context.request.json()
            } catch {
                throw new HttpError({ status: 400, body: { error: "Invalid request body." } })
            }
        }

        return next(context)
    }
}