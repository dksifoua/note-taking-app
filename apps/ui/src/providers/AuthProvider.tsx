import { type ReactNode, useState } from "react"
import { AuthContext, type AuthenticatedUser } from "../contexts/AuthContext"

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
    const [user] = useState<AuthenticatedUser>({ email: "dimitri.sifoua@gmail.com" })

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}