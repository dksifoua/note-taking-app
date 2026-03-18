import { AuthService } from "../services"
import { Injectable } from "@shared/ioc"
import type { HttpContext } from "@shared/http"
import { type AuthRequest, AuthRequestSchema, HttpResponse, validate } from "./requests"

@Injectable()
export class AuthHandler {
    private readonly authService: AuthService

    public constructor(authService: AuthService) {
        this.authService = authService
    }

    public async registration(context: HttpContext): Promise<Response> {
        const { email, password } = validate<AuthRequest>(AuthRequestSchema, context.body)
        const createdUser = await this.authService.registerUser(email, password)
        const origin = new URL(context.request.url).origin
        return HttpResponse.created({ Location: `${origin}/api/users/${createdUser._id}` })
    }

    public async login(context: HttpContext): Promise<Response> {
        const { email, password } = validate<AuthRequest>(AuthRequestSchema, context.body)
        const { token } = await this.authService.loginUser(email, password)
        return HttpResponse.noContent({ "Set-Cookie": `token=${token}; HttpOnly; SameSite=Strict; Max-Age=3600` })
    }
}