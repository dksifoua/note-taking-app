import { type JSX, type PropsWithChildren, useContext } from "react"
import { SecondaryButton } from "./SecondaryButton"
import { PrimaryButton } from "./PrimaryButton"
import { BaseButton } from "./BaseButton"
import { ButtonContext } from "./ButtonContext"

function ButtonFactory({ className, children }: PropsWithChildren<{ className?: string }>): JSX.Element {
    const { variant } = useContext(ButtonContext)

    if (variant === "primary") {
        return <PrimaryButton className={className}>{children}</PrimaryButton>
    }

    if (variant === "secondary") {
        return <SecondaryButton className={className}>{children}</SecondaryButton>
    }

    return <BaseButton className={className}>{children}</BaseButton>
}

type ButtonProps = {
    className?: string
    variant: "primary" | "secondary"
}

export function Button({ className, variant, children }: PropsWithChildren<ButtonProps>): JSX.Element {

    return (
        <ButtonContext.Provider value={{ variant }}>
            <ButtonFactory className={className} children={children} />
        </ButtonContext.Provider>
    )
}

Button.Icon = function ({ children }: PropsWithChildren): JSX.Element {
    const { variant } = useContext(ButtonContext)

    if (variant === "primary") {
        return <PrimaryButton.Icon>{children}</PrimaryButton.Icon>
    }

    if (variant === "secondary") {
        return <SecondaryButton.Icon>{children}</SecondaryButton.Icon>
    }

    return <BaseButton.Element>{children}</BaseButton.Element>
}

Button.Text = function ({ children }: PropsWithChildren): JSX.Element {
    const { variant } = useContext(ButtonContext)

    if (variant === "primary") {
        return <PrimaryButton.Text>{children}</PrimaryButton.Text>
    }

    if (variant === "secondary") {
        return <SecondaryButton.Text>{children}</SecondaryButton.Text>
    }

    return <BaseButton.Element>{children}</BaseButton.Element>
}