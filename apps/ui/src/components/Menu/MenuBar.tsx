import { type JSX } from "react"
import { ArchiveIcon, HomeIcon, SearchIcon, SettingIcon, TagIcon } from "../Icon"

export function MenuBar(): JSX.Element {

    return (
        <div
            className="lg:hidden h-14 md:h-18 flex flex-row px-4 md:px-8 py-3 items-center justify-between border-t border-t-neutral-200">
            <div className={`w-20 flex md:flex-col gap-y-1 py-1 items-center justify-center bg-blue-50 rounded-4`}>
                <HomeIcon className={`size-6 fill-blue-500`}/>
                <p className={`max-md:hidden text-preset-6 text-blue-500`}>Home</p>
            </div>
            <div className="max-md:hidden h-full border border-neutral-100"/>
            <div className={`w-20 flex md:flex-col gap-y-1 py-1 items-center justify-center rounded-4`}>
                <SearchIcon className={`size-6 fill-neutral-600`}/>
                <p className={`max-md:hidden text-preset-6 text-neutral-600`}>Search</p>
            </div>
            <div className="max-md:hidden h-full border border-neutral-100"/>
            <div className={`w-20 flex md:flex-col gap-y-1 py-1 items-center justify-center rounded-4`}>
                <ArchiveIcon className={`size-6 stroke-neutral-600`}/>
                <p className={`max-md:hidden text-preset-6 text-neutral-600`}>Archived</p>
            </div>
            <div className="max-md:hidden h-full border border-neutral-100"/>
            <div className={`w-20 flex md:flex-col gap-y-1 py-1 items-center justify-center rounded-4`}>
                <TagIcon className={`size-6 stroke-neutral-600`}/>
                <p className={`max-md:hidden text-preset-6 text-neutral-600`}>Tags</p>
            </div>
            <div className="max-md:hidden h-full border border-neutral-100"/>
            <div className={`w-20 flex md:flex-col gap-y-1 py-1 items-center justify-center rounded-4`}>
                <SettingIcon className={`size-6 fill-neutral-600`}/>
                <p className={`max-md:hidden text-preset-6 text-neutral-600`}>Settings</p>
            </div>
        </div>
    )
}