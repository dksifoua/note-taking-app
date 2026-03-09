import { type JSX } from "react"
import { ArchiveIcon, ArrowLeftIcon, DeleteIcon } from "../Icon"

export function HeaderControl(): JSX.Element {

    return (
        <div className="lg:hidden h-7.5 md:h-12.5 flex flex-row py-4 items-center justify-between border-b border-b-neutral-200">
            <div className="flex flex-row gap-x-1">
                <ArrowLeftIcon className="size-4.5 fill-neutral-600"/>
                <p className="text-preset-5 text-neutral-600">Go Back</p>
            </div>
            <div className="flex flex-row gap-x-4">
                <DeleteIcon className="size-4.5 stroke-neutral-600"/>
                <ArchiveIcon className="size-4.5 stroke-neutral-600"/>
                <p className="text-preset-5 text-neutral-600">Archive</p>
                <p className="text-preset-5 text-blue-500">Save Note</p>
            </div>
        </div>
    )
}