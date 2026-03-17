import { HttpApplication, HttpRouter } from "@shared/http"
import { Logger } from "@shared/logging"
import { ServiceCollection } from "@shared/ioc"
import { RootHandler, UserHandler } from "./handlers"
import { DatabaseContext } from "./persistence"
import mongoose from "mongoose"
import { UserRepository } from "./repositories"
import { UserService } from "./services"
import { LoggingMiddleware } from "./middlewares"
import { JsonBodyParserMiddleware } from "./middlewares/parser.middleware"

const logger = new Logger("API", "info")
try {
    await mongoose.connect(Bun.env.NOTE_TAKING_MONGODB_URI)
    logger.info(`Connected to MongoDB.`)
} catch (error) {
    await logger.fatal(`Failed to connect to MongoDB [uri=${Bun.env.NOTE_TAKING_MONGODB_URI}]: ${error}.`)
}

const services = new ServiceCollection()
services.addValue(Logger, logger)
services.addValue("connection", mongoose.connection)
services.addSingleton(LoggingMiddleware)
services.addSingleton(JsonBodyParserMiddleware)
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

const app = new HttpApplication(provider, logger)
app.use(provider.resolve(LoggingMiddleware))
app.use(provider.resolve(JsonBodyParserMiddleware))
app.mount("/api", router)

app.listen(Number(Bun.env.NOTE_TAKING_API_PORT) || 0)

process.on("SIGINT", (): never => {
    logger.info("Shutting down gracefully...")

    app.shutdown()
    provider.dispose()
    process.exit(0)
})