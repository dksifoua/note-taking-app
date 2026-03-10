import { Fragment, type JSX } from "react"
import { SideBarNavigation, SideBarNotes } from "../../components/SideBar"
import { Header } from "../../components/Header"
import { MenuBar, RightMenuBar } from "../../components/Menu"

export function HomePage(): JSX.Element {

    return (
        <Fragment>
            <div className="flex flex-row">
                <SideBarNavigation/>
                <div className="w-full flex flex-col">
                    <Header/>
                    <div className="flex flex-row">
                        <SideBarNotes/>
                        <RightMenuBar/>
                    </div>
                </div>
            </div>
            <div className="w-full fixed left-0 bottom-0">
                <MenuBar/>
            </div>
        </Fragment>
    )
}