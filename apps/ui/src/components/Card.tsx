import { type JSX } from "react"
import { ArchiveIcon, DeleteIcon } from "./Icon"
import { Button } from "./Button"

type CardProps = {
    type: "archive" | "delete"
}

export function Card({ type }: CardProps): JSX.Element {
    const icon = type === "archive" 
        ? <ArchiveIcon className="size-6 stroke-neutral-950"/> 
        : <DeleteIcon className="size-6 stroke-neutral-950"/>
    const title: string = type === "archive" ? "Archive Note" : "Delete Note"
    const description: JSX.Element = type === "archive"
        ? <span>Are you sure you want to archive this note?<br/><br/>You can find it in the Archived Notes section and restore it anytime.</span>
        : <span>Are you sure you want to permanently delete this note?<br/><br/>This action cannot be undone.</span>

    return (
        <div className="w-85 md:w-110 flex flex-col rounded-12 border border-neutral-200">
            <div className="h-32 flex flex-row gap-x-4 p-5">
                <div className="size-10 flex items-center justify-center bg-neutral-100 rounded-8">
                    {icon}
                </div>
                <div className="w-full flex flex-col gap-y-1.5">
                    <p className="text-preset-3 text-neutral-950">{title}</p>
                    <p className="text-preset-5 text-neutral-700">{description}</p>
                </div>
            </div>
            <div className="border border-neutral-200"/>
            <div className="flex flex-row gap-x-4 px-5 py-4 justify-end">
                <Button variant="secondary">
                    <Button.Text>Cancel</Button.Text>
                </Button>
                <Button variant={type === "archive" ? "primary" : "danger"}>
                    <Button.Text>{title}</Button.Text>
                </Button>
            </div>
        </div>
    )
}