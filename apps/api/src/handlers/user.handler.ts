import { UserService } from "../services"

export class UserHandler {
    public static $inject = [UserService]   
    private readonly userService: UserService

    public constructor(userService: UserService) {
        this.userService = userService
    }
    
    public async retrieve(): Promise<Response> {
        const users = await this.userService.getAllUsers()
        return Response.json(users.map(u => u.toObject()))
    }
}