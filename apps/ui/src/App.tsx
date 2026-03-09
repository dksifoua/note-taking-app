import { type JSX } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { Components } from "./Components"
import { AuthLayout } from "./pages/Auth"
import { AuthPage } from "./pages/Auth/AuthPage"

export function App(): JSX.Element {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/components" element={<Components/>}/>
                <Route element={<AuthLayout/>}>
                    <Route path="login" element={<AuthPage/>}/>
                    <Route path="register" element={<h1>Register</h1>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
