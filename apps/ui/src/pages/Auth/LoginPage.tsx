import React, { type JSX, useState } from "react"
import { AuthContainer } from "./AuthContainer"
import { InputTextGroup } from "../../components/Input"
import { Button } from "../../components/Button"
import { HideIcon, ShowIcon } from "../../components/Icon"

export function LoginPage(): JSX.Element {
    const [passwordInputType, setPasswordInputType] = useState<"password" | "text">("password")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    
    function switchPasswordIcon(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault()
        setShowPassword(!showPassword)
        setPasswordInputType(prevType => prevType === "password" ? "text" : "password")
    }

    return (
        <AuthContainer title="Welcome to Note" description="Please log in to continue">
            <AuthContainer.Form>
                <React.Fragment>
                    <InputTextGroup>
                        <InputTextGroup.Label htmlFor="email">Email</InputTextGroup.Label>
                        <InputTextGroup.Input type="text" id="email" name="email" placeholder="email@example.com"/>
                        <InputTextGroup.Error/>
                    </InputTextGroup>
                    <InputTextGroup>
                        <InputTextGroup.Label
                            htmlFor="password"
                            link={{ to: "/forgot-password", text: "Forgot?" }}
                        >Password</InputTextGroup.Label>
                        <InputTextGroup.Input type={passwordInputType} id="password" name="password">
                            <button className="cursor-pointer" onClick={switchPasswordIcon}>
                                {
                                    showPassword
                                        ? <HideIcon className="size-5"/> 
                                        : <ShowIcon className="size-5"/>
                                }
                            </button>
                        </InputTextGroup.Input>
                        <InputTextGroup.Error/>
                    </InputTextGroup>
                    <Button variant="primary">
                        <Button.Text>Login</Button.Text>
                    </Button>
                </React.Fragment>
            </AuthContainer.Form>
            <AuthContainer.GitHub action="login"/>
            <AuthContainer.Register/>
        </AuthContainer>
    )
}