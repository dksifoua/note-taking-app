import { ServiceCollection } from "@shared/ioc"
import { HttpApplication, type HttpContext, HttpRouter, type MayBePromise } from "@shared/http"
import { Logger } from "@shared/logging"
import { RootHandler } from "./handlers"

const logger = new Logger("API", "info")

const services = new ServiceCollection()
services.addSingletonInstance(Logger, logger)
services.addSingletonInstance("ILoggerFactory", (name: string) => logger.child(name))
services.addSingleton(RootHandler)

const provider = services.build()

const rootRouter = new HttpRouter()
rootRouter.get("/", (ctx) => ctx.scope.resolve(RootHandler).home())
rootRouter.get("/version", (ctx) => ctx.scope.resolve(RootHandler).version())

const app = new HttpApplication(provider)
app.mount("/api", rootRouter)
app.onError((error: unknown, _: HttpContext): MayBePromise<Response> => {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    logger.error(`\x1b[31m[error]\x1b[0m ${message}`)

    return Response.json({ error: message }, { status: 500 })
})
app.listen(Number(Bun.env.NOTE_TAKING_API_PORT))

process.on("SIGINT", async () => {
    logger.info("Shutting down gracefully...")

    app.shutdown()
    provider.dispose()
    process.exit(0)
})