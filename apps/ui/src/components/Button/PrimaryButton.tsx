import { type JSX, type PropsWithChildren } from "react"
import { BaseButton } from "./BaseButton"

type PrimaryButtonProps = {
    className?: string
}

export function PrimaryButton({ className, children }: PropsWithChildren<PrimaryButtonProps>): JSX.Element {

    return (
        <BaseButton className={`group bg-blue-500 rounded-8 hover:bg-blue-700 ${className}`}>
            {children}
        </BaseButton>
    )
}

PrimaryButton.Icon = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton.Child className={`fill-neutral-0`}>
            {children}
        </BaseButton.Child>
    )
}

PrimaryButton.Text = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton.Child className={`text-preset-4 text-neutral-0`}>
            {children}
        </BaseButton.Child>
    )
}