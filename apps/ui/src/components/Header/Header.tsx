import { type JSX } from "react"
import { InputTextGroup } from "../Input"
import { SearchIcon, SettingIcon } from "../Icon"
import { Logo } from "../Logo"

export function Header(): JSX.Element {

    return (
        <div>
            <div className="lg:hidden h-13 md:h-18 flex flex-row gap-x-4 px-4 md:px-8 py-3 md:py-4 items-center bg-neutral-100">
                <Logo/>
            </div>
            <div className="max-lg:hidden h-20 flex flex-row px-8 items-center justify-between border-b border-b-neutral-200">
                <p className="text-preset-1 text-neutral-950">All Notes</p>
                <div className="flex flex-row gap-x-4 items-center justify-between">
                    <InputTextGroup type="search" id="search" name="search" placeholder="Search by title, content, or tags…">
                        <InputTextGroup.Input>
                            <SearchIcon/>
                        </InputTextGroup.Input>
                    </InputTextGroup>
                    <div className="flex items-center justify-center">
                        <SettingIcon className="size-6 fill-neutral-500"/>
                    </div>
                </div>
            </div>
        </div>
    )
}