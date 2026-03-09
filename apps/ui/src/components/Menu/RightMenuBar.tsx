import { type JSX } from "react"
import { ArchiveIcon, DeleteIcon } from "../Icon"

export function RightMenuBar(): JSX.Element {

    return (
        <div className="max-lg:hidden min-w-64.5 h-screen flex flex-col gap-y-3 pl-4 py-5">
            <div className="flex flex-row gap-x-2 px-4 py-3 rounded-8 items-center border border-neutral-300">
                <ArchiveIcon className="size-5 stroke-neutral-950"/>
                <p className="text-preset-950 text-neutral-950">Archive Note</p>
            </div>
            <div className="flex flex-row gap-x-2 px-4 py-3 rounded-8 items-center border border-neutral-300">
                <DeleteIcon className="size-5 stroke-neutral-950"/>
                <p className="text-preset-950 text-neutral-950">Delete Note</p>
            </div>
        </div>
    )
}