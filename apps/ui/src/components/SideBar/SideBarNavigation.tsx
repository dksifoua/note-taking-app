import { type JSX } from "react"
import { Logo } from "../Logo"
import { ArchiveIcon, ChevronRightIcon, HomeIcon, TagIcon } from "../Icon"

const tags = ["Work", "Personal", "Ideas", "Projects", "Travel", "Health", "Finance", "Family", "Friends", "Hobbies"]

export function SideBarNavigation(): JSX.Element {

    return (
        <div className="max-lg:hidden min-w-73 h-screen flex flex-col gap-y-4 px-4 py-3 border-r border-r-neutral-200">
            <Logo/>
            <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-1 justify-between">
                    <div
                        className="h-10 flex flex-row gap-x-2 px-3 py-2.5 rounded-8 bg-neutral-100 items-center justify-between">
                        <HomeIcon className="size-5 fill-blue-500"/>
                        <p className="w-full text-preset-4 text-neutral-950">All Notes</p>
                        <ChevronRightIcon className="size-5 fill-neutral-950"/>
                    </div>
                    <div className="h-10 flex flex-row gap-x-2 px-3 py-2.5 rounded-8 items-center justify-between">
                        <ArchiveIcon className="size-5 stroke-neutral-700"/>
                        <p className="w-full text-preset-4 text-neutral-700">Archived Notes</p>
                    </div>
                </div>
                <div className="w-full border border-neutral-200"/>
                <div className="px-2.5 ">
                    <p className="text-preset-4 text-neutral-500">Tags</p>
                </div>
                <div className="flex flex-col gap-y-1">
                    {
                        tags.map((tag, index) => (
                            <div key={index} className="h-10 flex flex-row gap-x-2 px-3 py-2.5 items-center">
                                <TagIcon className="size-5 stroke-neutral-700"/>
                                <p className="w-full text-preset-4 text-neutral-700">{tag}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}