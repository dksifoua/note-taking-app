declare module "bun" {
    interface Env {
        NOTE_TAKING_API_PORT: string
        NOTE_TAKING_MONGODB_URI: string
    }
}