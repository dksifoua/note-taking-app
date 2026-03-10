import type { JSX } from "react"
import { Navigate, Outlet } from "react-router"
import { useAuthContext } from "../hooks/auth.hook"

export function ProtectedRoute(): JSX.Element {
    const { user } = useAuthContext()

    if (!user.email) {
        return <Navigate to="login" replace/>
    }

    return <Outlet/>
}