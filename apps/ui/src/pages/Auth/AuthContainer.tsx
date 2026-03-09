import { type JSX, type PropsWithChildren } from "react"
import { Logo } from "../../components/Logo"
import { GitHubIcon } from "../../components/Icon"
import { Button } from "../../components/Button"
import React from "react"
import { NavLink } from "react-router"

export function AuthContainer({ title, description, children }: PropsWithChildren<{
    title: string,
    description: string
}>): JSX.Element {

    return (
        <div
            className="w-85.75 md:w-130.5 xl:w-135 flex flex-col gap-y-4 px-4 md:px-8 xl:px-12 py-10 md:py-12 rounded-12 bg-neutral-0 border border-neutral-200 items-center">
            <Logo/>
            <div className="flex flex-col gap-y-2 items-center">
                <p className="text-preset-1 text-neutral-950">{title}</p>
                <p className="text-preset-5 text-neutral-600">{description}</p>
            </div>
            {children}
        </div>
    )
}

AuthContainer.Form = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <form className="w-full flex flex-col gap-y-4 pt-6">
            {children}
        </form>
    )
}

AuthContainer.GitHub = function ({ action }: { action: "login" | "register" }): JSX.Element {
    const text = action === "login" 
        ? "Or log in with:" 
        : "Or sign up with:"

    return (
        <div className="w-full flex flex-col gap-y-4 pt-6 border-t border-t-neutral-200 items-center">
            <p className="text-preset-5 text-neutral-600">{text}</p>
            <Button variant="secondary" className="w-full">
                <Button.Icon>
                    <GitHubIcon className={`size-5`}/>
                </Button.Icon>
                <Button.Text>GitHub</Button.Text>
            </Button>
        </div>
    )
}

AuthContainer.Register = function (): JSX.Element {

    return (
        <React.Fragment>
            <div className="w-full border border-neutral-200"/>
            <p className="text-preset-5 text-neutral-600">
                No account yet?&nbsp;
                <span className="text-neutral-950">
                    <NavLink to="/register">
                        Sign Up
                    </NavLink>
                </span>
            </p>
        </React.Fragment>
    )
}

AuthContainer.Login = function (): JSX.Element {

    return (
        <React.Fragment>
            <div className="w-full border border-neutral-200"/>
            <p className="text-preset-5 text-neutral-600">
                Already have an account?&nbsp;
                <span className="text-neutral-950">
                    <NavLink to="/login">
                        Login
                    </NavLink>
                </span>
            </p>
        </React.Fragment>
    )
}