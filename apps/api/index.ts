const server = Bun.serve({
    port: 3000,
    fetch(): Response {
        return new Response("Hello via Bun!")
    }
})

console.log(`Api is listening on ${server.url}`)