import { createContext } from "react"

export type AuthenticatedUser = { email: string | undefined }

export type AuthContextType = {
    user: AuthenticatedUser
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)