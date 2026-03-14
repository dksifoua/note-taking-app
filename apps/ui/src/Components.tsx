import { type JSX } from "react"
import { SideBarNavigation, SideBarNotes } from "./components/SideBar"
import { MenuBar, RightMenuBar, SettingsMenu } from "./components/Menu"
import { Header, HeaderControl } from "./components/Header"
import { RefreshLeftIcon, SearchIcon, TagIcon } from "./components/Icon"
import { Toast } from "./components/Toast"
import { Button } from "./components/Button"
import { InputTextGroup } from "./components/Input"
import { Card } from "./components/Card"

export function Components(): JSX.Element {

    return (
        <div className="flex flex-row gap-4 p-2">
            <SideBarNotes/>
            <SideBarNavigation/>
            <SettingsMenu/>
            <RightMenuBar/>

            <div className="flex flex-col gap-4 p-5">
                <MenuBar/>
                <HeaderControl/>
                <Header/>
                <TagIcon className="size-5 stroke-neutral-600"/>
                <SearchIcon className="size-5 fill-neutral-600"/>
                <Toast message="Note saved successfully!"/>
                <Toast message="Note archived." link="Archived Notes"/>
                <Button variant="primary">
                    <Button.Icon>
                        <RefreshLeftIcon className={`size-5`}/>
                    </Button.Icon>
                    <Button.Text>Default</Button.Text>
                </Button>
                <Button variant="secondary" className="w-30">
                    <Button.Icon>
                        <RefreshLeftIcon className={`size-5`}/>
                    </Button.Icon>
                    <Button.Text>Icon</Button.Text>
                </Button>
                <InputTextGroup>
                    <InputTextGroup.Label htmlFor="email">Email</InputTextGroup.Label>
                    <InputTextGroup.Input type="text" id="email" name="email" placeholder="Enter your email"
                                          icon={{Icon: SearchIcon, css: "fill"}}/>
                    <InputTextGroup.Error errorMessage="This is an error text to help user."/>
                </InputTextGroup>
                <div className="flex flex-row gap-x-2">
                    <Card type="archive"/>
                    <Card type="delete"/>
                </div>
                <MenuBar/>
            </div>
        </div>
    )
}