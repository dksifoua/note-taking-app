import { createContext } from "react"

type ButtonContextType = {
    variant: "primary" | "secondary"
}

export const ButtonContext = createContext<ButtonContextType>({ 
    variant: "primary"
})