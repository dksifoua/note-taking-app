import { type JSX } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { Components } from "./Components"
import { AuthLayout, ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/Auth"
import { AuthProvider } from "./providers/AuthProvider"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { HomePage } from "./pages/Home"

export function App(): JSX.Element {

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="components" element={<Components/>}/>
                    
                    <Route element={<AuthLayout/>}>
                        <Route path="login" element={<LoginPage/>}/>
                        <Route path="register" element={<RegisterPage/>}/>
                        <Route path="forgot-password" element={<ForgotPasswordPage/>}/>
                    </Route>

                    <Route element={<ProtectedRoute/>}>
                        <Route index element={<HomePage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
