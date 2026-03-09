import { type JSX, type PropsWithChildren } from "react"
import { BaseButton } from "./BaseButton"

type DangerButtonProps = {
    className?: string
}

export function DangerButton({ className, children }: PropsWithChildren<DangerButtonProps>): JSX.Element {

    return (
        <BaseButton className={`group bg-red-500 rounded-8 hover:bg-red-700 ${className}`}>
            {children}
        </BaseButton>
    )
}

DangerButton.Icon = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton.Child className={`fill-neutral-0`}>
            {children}
        </BaseButton.Child>
    )
}

DangerButton.Text = function ({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton.Child className={`text-preset-4 text-neutral-0`}>
            {children}
        </BaseButton.Child>
    )
}