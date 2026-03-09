import { type JSX } from "react"
import { ChevronRightIcon, LogoutIcon, PasswordIcon, SunIcon, TypeIcon } from "../Icon"

export function SettingsMenu(): JSX.Element {

    return (
        <div className="max-lg:hidden min-w-64.5 h-screen flex flex-col gap-y-2 pl-8 pr-4 py-5 border-r border-r-neutral-200">
            <div className="flex flex-row gap-x-2 p-2 rounded-6 bg-neutral-100 items-center">
                <SunIcon className="size-5 stroke-neutral-950"/>
                <p className="w-full text-preset-4 text-neutral-950">Color Theme</p>
                <ChevronRightIcon className="size-5 fill-neutral-950"/>
            </div>
            <div className="flex flex-row gap-x-2 p-2 items-center">
                <TypeIcon className="size-5 fill-neutral-700"/>
                <p className="w-full text-preset-4 text-neutral-700">Font Theme</p>
            </div>
            <div className="flex flex-row gap-x-2 p-2 items-center">
                <PasswordIcon className="size-5 stroke-neutral-700"/>
                <p className="text-preset-4 text-neutral-700">Change Password</p>
            </div>
            <div className="border border-neutral-200 items-center"/>
            <div className="flex flex-row gap-x-2 p-2">
                <LogoutIcon className="size-5 stroke-neutral-700"/>
                <p className="w-full text-preset-4 text-neutral-700">Logout</p>
            </div>
        </div>
    )
}