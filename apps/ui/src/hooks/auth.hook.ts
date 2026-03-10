import { AuthContext, type AuthContextType } from "../contexts/AuthContext"
import { useContext } from "react"

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("AuthContext must be used within AuthContext.Provider")
    }

    return context
}