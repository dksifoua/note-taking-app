import React, { type JSX, type PropsWithChildren } from "react"

type BaseButtonProps = {
    className?: string
}

export function BaseButton({ className, children }: PropsWithChildren<BaseButtonProps>): JSX.Element {

    return (
        <button className={`flex flex-row gap-x-2 px-4 py-3 items-center justify-center cursor-pointer ${className}`}>
            {children}
        </button>
    )
}

BaseButton.Child = function ({ className, children }: PropsWithChildren<BaseButtonProps>): JSX.Element {

    return (
        <React.Fragment>
            {
                React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        const element = child as React.ReactElement<{ className?: string }>
                        return React.cloneElement(element, {
                            className: `${element.props.className} ${className}`
                        })
                    }

                    if (typeof child === "string") {
                        return <p className={className}>{child}</p>
                    }

                    return child
                })
            }
        </React.Fragment>
    )
}