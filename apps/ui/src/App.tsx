import { type JSX } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { Components } from "./Components"
import { AuthLayout, ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/Auth"

export function App(): JSX.Element {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/components" element={<Components/>}/>
                <Route element={<AuthLayout/>}>
                    <Route path="login" element={<LoginPage/>}/>
                    <Route path="register" element={<RegisterPage/>}/>
                    <Route path="forgot-password" element={<ForgotPasswordPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
