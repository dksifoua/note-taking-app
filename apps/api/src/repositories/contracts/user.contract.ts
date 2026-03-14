import type { ClientSession, Document } from "mongoose"
import type { IUser } from "../../schemas"

export interface IUserDocument extends IUser, Document {
    createdAt?: Date
    updatedAt?: Date
}

export interface IUserRepository {
    findAll(): Promise<IUserDocument[]>
    findByEmail(email: string): Promise<IUserDocument | null>
    create(data: IUser, session?: ClientSession): Promise<IUserDocument>
    delete(id: string, session?: ClientSession): Promise<void>
}