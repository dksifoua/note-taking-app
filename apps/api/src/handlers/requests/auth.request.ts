import { z } from "zod"

export const AuthRequestSchema = z.object({
    email: z.email().nonoptional(),
    password: z.string().nonempty({ message: "Password cannot be empty" })
}).required()

export type AuthRequest = z.infer<typeof AuthRequestSchema>