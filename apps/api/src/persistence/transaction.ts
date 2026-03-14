import type { ClientSession } from "mongoose"
import type { DatabaseContext } from "./context"

export class DatabaseTransactionManager {
    private readonly context: DatabaseContext

    public constructor(context: DatabaseContext) {
        this.context = context
    }

    public async withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
        const session: ClientSession = await this.context.startSession()

        session.startTransaction()
        try {
            const result: T = await fn(session)
            await session.commitTransaction()
            return result
        } catch (err) {
            await session.abortTransaction()
            throw err
        } finally {
            await session.endSession()
        }
    }
}