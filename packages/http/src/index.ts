import { Http } from "./http"
import { ErrorMiddleware, LoggingMiddleware } from "./middleware"

const http = new Http()
http.use(new LoggingMiddleware())
http.use(new ErrorMiddleware())

http.get("/", async (): Promise<Response> => {
    return Response.json({ message: "Welcome to Bun REST API 🚀"}, { status: 200 })
})

http.listen()