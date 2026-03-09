import type { JSX } from "react"
import { Outlet } from "react-router"

export function AuthLayout(): JSX.Element {

    return (
        <div className="h-screen flex items-center justify-center bg-neutral-100">
            <Outlet/>
        </div>
    )
}