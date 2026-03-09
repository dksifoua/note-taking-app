import { type JSX } from "react"
import { ArchiveIcon, DeleteIcon } from "./icons"
import { Button } from "./Button"

type CardProps = {
    type: "archive" | "delete"
}

export function Card({ type }: CardProps): JSX.Element {
    const Icon = type === "archive" ? ArchiveIcon : DeleteIcon
    const title: string = type === "archive" ? "Archive Note" : "Delete Note"
    const description: string = type === "archive"
        ? "Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime."
        : "Are you sure you want to permanently delete this note? This action cannot be undone."

    return (
        <div className="w-85 md:w-110 flex flex-col rounded-12 border border-neutral-200">
            <div className="flex flex-row gap-x-4 p-5">
                <div className="size-10 flex items-center justify-center bg-neutral-100 rounded-8">
                    <Icon className="size-6"/>
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