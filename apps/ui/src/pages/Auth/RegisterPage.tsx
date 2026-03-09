import React, { type JSX } from "react"
import { AuthContainer } from "./AuthContainer"
import { InputTextGroup } from "../../components/Input"
import { ShowIcon } from "../../components/Icon"
import { Button } from "../../components/Button"

export function RegisterPage(): JSX.Element {

    return (
        <AuthContainer
            title="Create Your Account"
            description="Sign up to start organizing your notes and boost your productivity."
        >
            <AuthContainer.Form>
                <React.Fragment>
                    <InputTextGroup type="email" id="email" name="email" placeholder="email@example.com" errorMessage="">
                        <InputTextGroup.Label>Email</InputTextGroup.Label>
                        <InputTextGroup.Input/>
                        <InputTextGroup.Error/>
                    </InputTextGroup>
                    <InputTextGroup type="password" id="password" name="password" errorMessage="">
                        <InputTextGroup.Label>Password</InputTextGroup.Label>
                        <InputTextGroup.Input RightIcon={ShowIcon}/>
                        <InputTextGroup.Error/>
                    </InputTextGroup>
                    <Button variant="primary">
                        <Button.Text>Sign up</Button.Text>
                    </Button>
                </React.Fragment>
            </AuthContainer.Form>
            <AuthContainer.GitHub action="register"/>
            <AuthContainer.Login/>
        </AuthContainer>
    )
}