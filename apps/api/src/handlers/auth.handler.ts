import { UserService } from "../services"
import { Injectable } from "@shared/ioc"
import type { HttpContext } from "@shared/http"
import type { IUser } from "../schemas"

@Injectable()
export class AuthHandler {
    private readonly userService: UserService

    public constructor(userService: UserService) {
        this.userService = userService
    }

    public async register(context: HttpContext): Promise<Response> {
        const { email, password } = context.body as IUser
        const createdUser = await this.userService.createUser(email, password)
        return Response.json(createdUser, { status: 201 })
    }
}