import { UserService } from "../services"
import { Injectable } from "@shared/ioc"

@Injectable()
export class UserHandler { 
    private readonly userService: UserService

    public constructor(userService: UserService) {
        this.userService = userService
    }
    
    public async retrieve(): Promise<Response> {
        const users = await this.userService.getAllUsers()
        return Response.json(users.map(u => u.toObject()))
    }
}