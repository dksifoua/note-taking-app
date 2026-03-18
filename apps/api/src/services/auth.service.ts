import * as bcrypt from "bcrypt"
import type { IUserDocument } from "../repositories/contracts"
import { UserRepository } from "../repositories"
import { Injectable } from "@shared/ioc"

@Injectable()
export class AuthService {
    private readonly userRepository: UserRepository

    public constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    public async registerUser(email: string, password: string): Promise<IUserDocument> {
        if (await this.userRepository.existByEmail(email)) {
            throw new Error(`User with email [${email}] already exists.`)
        }

        return this.userRepository.create({ email, password })
    }

    public async loginUser(email: string, password: string): Promise<{ token: string }> {
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new Error(`User with email [${email}] not found.`)
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new Error(`Invalid password for user [${email}].`)
        }

        return { token: Bun.randomUUIDv7() }
    }
}