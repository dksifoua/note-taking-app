import { createContext } from "react"

type ButtonContextType = {
    variant: "primary" | "secondary" | "danger"
}

export const ButtonContext = createContext<ButtonContextType>({ 
    variant: "primary"
})