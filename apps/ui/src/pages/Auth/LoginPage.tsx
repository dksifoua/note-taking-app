import React, { type JSX } from "react"
import { AuthContainer } from "./AuthContainer"
import { InputTextGroup } from "../../components/Input"
import { ShowIcon } from "../../components/Icon"
import { Button } from "../../components/Button"

export function LoginPage(): JSX.Element {

    return (
        <AuthContainer title="Welcome to Note" description="Please log in to continue">
            <AuthContainer.Form>
                <React.Fragment>
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
                </React.Fragment>
            </AuthContainer.Form>
            <AuthContainer.GitHub action="login"/>
            <AuthContainer.Register/>
        </AuthContainer>
    )
}