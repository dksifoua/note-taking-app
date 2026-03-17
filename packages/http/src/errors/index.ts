export * from "./http.error"

export class ServerNotRunningError extends Error {
    
    public constructor() {
        super("Server is not running.")
    }
}