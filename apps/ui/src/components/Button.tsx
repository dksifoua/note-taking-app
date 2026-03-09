import { type JSX, type PropsWithChildren } from "react"
import { RefreshLeftIcon } from "./icons"

function BaseButton({ className, children }: PropsWithChildren<{ className?: string }>): JSX.Element {

    return (
        <button className={`w-35 flex flex-row gap-x-2 px-4 py-3 items-center justify-center ${className}`}>
            {children}
        </button>
    )
}

function PrimaryButton({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton className={`group bg-blue-500 rounded-8 hover:bg-blue-700`}>
            <p className="text-preset-4 text-neutral-0">{children}</p>
        </BaseButton>
    )
}

function SecondaryButton({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton className={`group bg-neutral-100 rounded-8 hover:outline hover:outline-neutral-300 hover:bg-neutral-0`}>
            <p className="text-preset-4 text-neutral-600 group-hover:text-neutral-950">{children}</p>
        </BaseButton>
    )
}

function BorderButton({ children }: PropsWithChildren): JSX.Element {

    return (
        <BaseButton className={`group outline outline-neutral-300 rounded-8 hover:outline-none hover:bg-neutral-100`}>
            <RefreshLeftIcon className="w-5 h-5 fill-neutral-950 group-hover:fill-neutral-600"/>
            <p className="text-preset-4 text-neutral-950 group-hover:text-neutral-600">{children}</p>
        </BaseButton>
    )
}

export function Button({variant, children}: PropsWithChildren<{variant: "primary" | "secondary" | "border"}>): JSX.Element {
    
    if (variant === "primary") {
        return <PrimaryButton>{children}</PrimaryButton>
    }
    
    if (variant === "secondary") {
        return <SecondaryButton>{children}</SecondaryButton>
    }

    if (variant === "border") {
        return <BorderButton>{children}</BorderButton>
    }
    
    return <BaseButton>{children}</BaseButton>
}