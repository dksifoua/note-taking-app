import { DatabaseContext } from "../persistence"
import type { IUser } from "../schemas"
import type { IUserDocument, IUserRepository } from "./contracts"
import type { ClientSession } from "mongoose"

export class UserRepository implements IUserRepository {
    private readonly context: DatabaseContext

    public constructor(databaseContext: DatabaseContext) {
        this.context = databaseContext
    }
    
    public async findAll(): Promise<IUserDocument[]> {
        return this.context.Users.find().exec()
    }

    public async findByEmail(email: string): Promise<IUserDocument | null> {
        return this.context.Users.findOne({ email }).exec()
    }

    public async create(data: IUser, session?: ClientSession): Promise<IUserDocument> {
        const [user] = await this.context.Users.create([data], { session })
        if (!user) {
            throw new Error("Failed to create user")
        }

        return user
    }
    
    public async delete(id: string, session?: ClientSession): Promise<void> {
        if (!await this.context.Users.findByIdAndDelete(id, { session }).exec()) {
            throw new Error(`User with id ${id} not found`)
        }
    }
}