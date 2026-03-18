import { UserService } from "../services"
import { Injectable } from "@shared/ioc"
import type { HttpContext } from "@shared/http"
import { HttpResponse } from "./requests"

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

    public async retrieveById(context: HttpContext): Promise<Response> {
        const id = context.params.id!

        const user = await this.userService.getUserById(id)

        return Response.json(user.toObject())
    }

    public async deleteById(context: HttpContext): Promise<Response> {
        const id = context.params.id!

        await this.userService.deleteUserById(id)
        return HttpResponse.noContent()
    }
}