import type { IUserDocument } from "../repositories/contracts"
import type { IUserService } from "./contracts"
import { UserRepository } from "../repositories"
import { Injectable } from "@shared/ioc"

@Injectable()
export class UserService implements IUserService {
    private readonly userRepository: UserRepository

    public constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }
    
    public async getAllUsers(): Promise<IUserDocument[]> {
        return this.userRepository.findAll()
    }

    public async getUserById(id: string): Promise<IUserDocument> {
        const user: IUserDocument | null = await this.userRepository.findById(id)
        if (!user) {
            throw new Error(`User with id [${id}] not found.`)
        }

        return user
    }
    
    public async getUserByEmail(email: string): Promise<IUserDocument> {
        const user: IUserDocument | null = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new Error(`User with email [${email}] not found.`)
        }
        
        return user
    }
    
    public async deleteUserById(id: string): Promise<void> {
        await this.userRepository.delete(id)
    }
}