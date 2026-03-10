import React, { type JSX } from "react"
import { InputTextGroup } from "../../components/Input"
import { Button } from "../../components/Button"
import { AuthContainer } from "./AuthContainer"

export function ForgotPasswordPage(): JSX.Element {

    return (
        <AuthContainer
            title="Forgotten your password?"
            description="Enter your email below, and we’ll send you a link to reset it."
        >
            <AuthContainer.Form>
                <React.Fragment>
                    <InputTextGroup>
                        <InputTextGroup.Label htmlFor="email">Email Address</InputTextGroup.Label>
                        <InputTextGroup.Input type="email" id="email" name="email" placeholder="email@example.com"/>
                        <InputTextGroup.Error/>
                    </InputTextGroup>
                    <Button variant="primary">
                        <Button.Text>Send Reset Link</Button.Text>
                    </Button>
                </React.Fragment>
            </AuthContainer.Form>
        </AuthContainer>
    )
}