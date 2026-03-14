import type { IUserDocument, IUserRepository } from "../repositories/contracts"
import type { IUserService } from "./contracts"

export class UserService implements IUserService {
    private readonly userRepository: IUserRepository

    public constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }
    
    public async getAllUsers(): Promise<IUserDocument[]> {
        return this.userRepository.findAll()
    }
    
    public async getUserByEmail(email: string): Promise<IUserDocument> {
        const user: IUserDocument | null = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new Error(`User with email ${email} not found`)
        }
        
        return user
    }
    
    public async createUser(email: string, password: string): Promise<IUserDocument> {
        return this.userRepository.create({ email, password })
    }
    
    public async deleteUserById(id: string): Promise<void> {
        await this.userRepository.delete(id)
    }
}