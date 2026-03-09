import { type JSX } from "react"
import { Logo } from "../../components/Logo"
import { InputTextGroup } from "../../components/Input"
import { Button } from "../../components/Button"
import { GitHubIcon, ShowIcon } from "../../components/Icon"

export function AuthPage(): JSX.Element {

    return (
        <div
            className="w-85.75 md:w-130.5 xl:w-135 h-150.75 md:h-154.75 xl:h-155.75 flex flex-col gap-y-4 px-4 md:px-8 xl:px-12 py-10 md:py-12 rounded-12 bg-neutral-0 border border-neutral-200 items-center">
            <Logo/>
            <div className="flex flex-col gap-y-2 items-center">
                <p className="text-preset-1 text-neutral-950">Welcome to Note</p>
                <p className="text-preset-5 text-neutral-600">Please log in to continue</p>
            </div>
            <form className="w-full flex flex-col gap-y-4">
                <InputTextGroup type="email" id="email" name="email" placeholder="email@example.com" errorMessage="">
                    <InputTextGroup.Label>Email</InputTextGroup.Label>
                    <InputTextGroup.Input/>
                    <InputTextGroup.Error/>
                </InputTextGroup>
                <InputTextGroup type="password" id="password" name="password" errorMessage="" link={{ to: "/forgot-password", text: "Forgot?" }}>
                    <InputTextGroup.Label>Password</InputTextGroup.Label>
                    <InputTextGroup.Input RightIcon={ShowIcon}/>
                    <InputTextGroup.Error/>
                </InputTextGroup>
                <Button variant="primary">
                    <Button.Text>Login</Button.Text>
                </Button>
            </form>
            <div className="w-full flex flex-col gap-y-4 pt-6 border-t border-t-neutral-200 items-center">
                <p className="text-preset-5 text-neutral-600">Or log in with:</p>
                <Button variant="secondary" className="w-full">
                    <Button.Icon>
                        <GitHubIcon className={`size-5`}/>
                    </Button.Icon>
                    <Button.Text>GitHub</Button.Text>
                </Button>
            </div>
            <div className="w-full border border-neutral-200"/>
            <p className="text-preset-5 text-neutral-600">
                No account yet?&nbsp;
                <span className="text-neutral-950">Sign Up</span>
            </p>
        </div>
    )
}