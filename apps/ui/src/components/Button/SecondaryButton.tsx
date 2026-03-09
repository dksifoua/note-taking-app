import { type JSX, type PropsWithChildren } from "react"
import { BaseButton } from "./BaseButton"

type SecondaryButtonProps = {
    className?: string
}

export function SecondaryButton({ className, children }: PropsWithChildren<SecondaryButtonProps>): JSX.Element {

    return (
        <BaseButton
            className={`group bg-neutral-100 rounded-8 hover:outline hover:outline-neutral-300 hover:bg-neutral-0 ${className}`}>
            {children}
        </BaseButton>
    )
}

SecondaryButton.Icon = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton.Child className={`fill-neutral-600 group-hover:fill-neutral-950`}>
            {children}
        </BaseButton.Child>
    )
}

SecondaryButton.Text = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton.Child className={`text-preset-4 text-neutral-600 group-hover:text-neutral-950`}>
            {children}
        </BaseButton.Child>
    )
}