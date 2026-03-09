import React, { type JSX, type PropsWithChildren } from "react"
import { InfoCircleIcon } from "../Icon"
import {
    InputTextGroupContext,
    type InputTextGroupContextType,
    useInputTextGroupContext
} from "./InputTextGroupContext"
import { NavLink } from "react-router"

type InputTextGroupProps = InputTextGroupContextType & {
    className?: string
}

export function InputTextGroup(
    { type, id, name, className, placeholder, errorMessage, link, children }: PropsWithChildren<InputTextGroupProps>
): JSX.Element {

    return (
        <InputTextGroupContext.Provider value={{ type, id, name, placeholder, errorMessage, link }}>
            <div className={`flex flex-col gap-y-1.5 ${className}`}>
                {children}
            </div>
        </InputTextGroupContext.Provider>
    )
}

InputTextGroup.Label = function ({ children }: PropsWithChildren): JSX.Element {
    const { id, link } = useInputTextGroupContext()

    return (
        <div className="flex flex-row items-center justify-between">
            <label htmlFor={id} className="text-preset-4 text-neutral-950">{children}</label>
            {
                link && <NavLink to={link.to}>
                    <span className="text-preset-6 text-neutral-600 underline">{link.text}</span>
                </NavLink>
            }
        </div>
    )
}

InputTextGroup.Input = function ({ RightIcon }: {
    RightIcon?: React.ComponentType<{ className?: string }>
}): JSX.Element {
    const { type, id, name, placeholder } = useInputTextGroupContext()

    return (
        <div className="flex flex-row gap-x-1 px-4 py-3 rounded-8 border border-neutral-300">
            <input type={type} id={id} name={name} placeholder={placeholder}
                   className="w-full focus:outline-none text-preset-5 text-neutral-950 placeholder:text-neutral-500"/>
            {
                RightIcon && <RightIcon className="size-5 fill-neutral-500"/>
            }
        </div>
    )
}

InputTextGroup.Error = function (): JSX.Element {
    const { errorMessage } = useInputTextGroupContext()

    if (!errorMessage || errorMessage.trim().length === 0) {
        return <></>
    }

    return (
        <div className="flex flex-row gap-x-2">
            <InfoCircleIcon className="size-4 stroke-red-500"/>
            <p className="text-preset-6 text-red-500">{errorMessage}</p>
        </div>
    )
}
