import { type JSX } from "react"
import { Button } from "./components/Button"
import { RefreshLeftIcon } from "./components/icons"
import { Card } from "./components/Card"

export function App(): JSX.Element {

    return (
        <div className="flex flex-col gap-4 px-5">
            <h1>Note Taking App</h1>
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
            <Card type="delete"/>
        </div>
    )
}
