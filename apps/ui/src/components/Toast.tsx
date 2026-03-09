import { type JSX } from "react"
import { CheckCircleIcon, CloseRemoveIcon } from "./Icon"

export function Toast({ message, link }: { message: string, link?: string }): JSX.Element {

    return (
        <div
            className="w-97.5 h-8 flex flex-row gap-x-2 p-2 rounded-8 items-center justify-between border border-neutral-200">
            <CheckCircleIcon className="size-4 fill-green-500"/>
            <div className="w-full flex flex-row justify-between">
                <p className="text-preset-6 text-neutral-950">{message}</p>
                {link && <a href="#" className="text-preset-6 text-neutral-950 underline">{link}</a>}
            </div>
            <CloseRemoveIcon className="size-4 stroke-neutral-400"/>
        </div>
    )
}