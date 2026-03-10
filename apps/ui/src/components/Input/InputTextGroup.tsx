import React, { type JSX, type PropsWithChildren } from "react"
import { InfoCircleIcon } from "../Icon"
import { NavLink } from "react-router"

type InputTextGroupProps = {
    className?: string
}

export function InputTextGroup({ className, children }: PropsWithChildren<InputTextGroupProps>): JSX.Element {

    return (
        <div className={`flex flex-col gap-y-1.5 ${className}`}>
            {children}
        </div>
    )
}

type LabelProps = {
    htmlFor: string
    link?: { to: string, text: string }
}

InputTextGroup.Label = function ({ htmlFor, link, children }: PropsWithChildren<LabelProps>): JSX.Element {

    return (
        <div className="flex flex-row items-center justify-between">
            <label htmlFor={htmlFor} className="text-preset-4 text-neutral-950">{children}</label>
            {
                link && <NavLink to={link.to}>
                    <span className="text-preset-6 text-neutral-600 underline">{link.text}</span>
                </NavLink>
            }
        </div>
    )
}

type InputProps = {
    type: string
    id: string
    name: string
    placeholder?: string
    icon?: {
        Icon: React.ComponentType<{ className?: string }>
        css: "fill" | "stroke"
    }
    className?: string
}

InputTextGroup.Input = function (
    { type, id, name, placeholder, icon, className, children }: PropsWithChildren<InputProps>
): JSX.Element {

    return (
        <div className={`flex flex-row gap-x-1 px-4 py-3 rounded-8 border border-neutral-300 ${className}`}>
            {icon && <icon.Icon className={`size-5 ${icon.css}-neutral-500`}/>}
            <input type={type} id={id} name={name} placeholder={placeholder}
                   className="w-full focus:outline-none text-preset-5 text-neutral-950 placeholder:text-neutral-500"/>
            {children}
        </div>
    )
}

InputTextGroup.Error = function ({ errorMessage }: { errorMessage?: string }): JSX.Element {

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
