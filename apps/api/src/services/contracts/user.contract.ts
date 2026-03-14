import type { IUserDocument } from "../../repositories/contracts"

export interface IUserService {
    getAllUsers(): Promise<IUserDocument[]>
    getUserByEmail(email: string): Promise<IUserDocument>
    createUser(email: string, password: string): Promise<IUserDocument>
    deleteUserById(id: string): Promise<void>
}