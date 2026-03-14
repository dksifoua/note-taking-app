import type { ClientSession, Connection, Model } from "mongoose"
import { type IUser, UserSchema } from "../schemas/"
import { Inject } from "@shared/ioc"
import { Tokens } from "../tokens"

export class DatabaseContext {
    public static $inject = [Tokens.Connection]
    private readonly connection: Connection
    public readonly Users: Model<IUser>

    public constructor(@Inject(Tokens.Connection) connection: Connection) {
        this.connection = connection

        this.Users = (this.connection.models["User"] as Model<IUser>) 
            ?? this.connection.model<IUser>("User", UserSchema)
    }

    public async startSession(): Promise<ClientSession> {
        return this.connection.startSession()
    }
}