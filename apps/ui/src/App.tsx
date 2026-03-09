import { type JSX } from "react"
import { Button } from "./components/Button"
import { RefreshLeftIcon, SearchIcon } from "./components/icons"
import { Card } from "./components/Card"
import { InputTextGroup } from "./components/Input"
import { Toast } from "./components/Toast"
import { Header, HeaderControl } from "./components/Header"

export function App(): JSX.Element {

    return (
        <div className="flex flex-col gap-4 p-5">
            <HeaderControl/>
            <Header/>
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
            <InputTextGroup type="text" id="email" name="email" placeholder="Enter your email" errorMessage="This is an error text to help user.">
                <InputTextGroup.Label>Email</InputTextGroup.Label>
                <InputTextGroup.Input>
                    <SearchIcon/>
                </InputTextGroup.Input>
                <InputTextGroup.Error/>
            </InputTextGroup>
            <Card type="delete"/>
        </div>
    )
}
