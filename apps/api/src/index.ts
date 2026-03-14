import { ServiceCollection } from "@shared/ioc"
import { HttpApplication, type HttpContext, HttpRouter, type MayBePromise } from "@shared/http"
import { Logger } from "@shared/logging"
import { RootHandler } from "./handlers"
import { DatabaseContext } from "./persistence"
import mongoose from "mongoose"
import { UserRepository } from "./repositories"
import { UserService } from "./services"
import { UserHandler } from "./handlers/user.handler"
import { Tokens } from "./tokens"

const logger = new Logger("API", "info")
try {
    await mongoose.connect(Bun.env.NOTE_TAKING_MONGODB_URI)
    logger.info(`Connected to MongoDB.`)
} catch (error) {
    await logger.fatal(`Failed to connect to MongoDB [${Bun.env.NOTE_TAKING_MONGODB_URI}]: ${error}.`)
}

const services = new ServiceCollection()
services.addSingletonInstance(Logger, logger)
services.addSingletonInstance(Tokens.Connection, mongoose.connection)
services.addScoped(DatabaseContext)
services.addScoped(UserRepository)
services.addScoped(UserService)
services.addScoped(UserHandler)
services.addScoped(RootHandler)

const provider = services.build()

const router = new HttpRouter()
    .get("/", (ctx) => ctx.scope.resolve(RootHandler).home())
    .get("/version", (ctx) => ctx.scope.resolve(RootHandler).version())
    .mount("/users", new HttpRouter()
        .get("/", (ctx) => ctx.scope.resolve(UserHandler).retrieve())
    )

const app = new HttpApplication(provider)
app.mount("/api", router)
app.onError((error: unknown, _: HttpContext): MayBePromise<Response> => {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    logger.error(message)

    return Response.json({ error: message }, { status: 500 })
})
app.listen(Number(Bun.env.NOTE_TAKING_API_PORT) || 0)

process.on("SIGINT", (): never => {
    logger.info("Shutting down gracefully...")

    app.shutdown()
    provider.dispose()
    process.exit(0)
})