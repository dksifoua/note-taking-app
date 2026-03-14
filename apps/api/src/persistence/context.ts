import type { ClientSession, Connection, Model } from "mongoose"
import { type IUser, UserSchema } from "../schemas/"

// TODO
//  Implement IDisposable
export class DatabaseContext {
    private readonly connection: Connection
    public readonly Users: Model<IUser>

    public constructor(connection: Connection) {
        this.connection = connection

        this.Users = (this.connection.models["User"] as Model<IUser>) 
            ?? this.connection.model<IUser>("User", UserSchema)
    }

    public async startSession(): Promise<ClientSession> {
        return this.connection.startSession()
    }
}