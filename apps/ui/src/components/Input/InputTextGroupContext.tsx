import { createContext, useContext } from "react"

export type InputTextGroupContextType = {
    type: string
    id: string
    name: string
    placeholder: string
    errorMessage?: string
}

export const InputTextGroupContext = createContext<InputTextGroupContextType | undefined>(undefined)

export function useInputTextGroupContext(): InputTextGroupContextType {
    const context = useContext(InputTextGroupContext)
    if (context === undefined) {
        throw new Error("useInputTextGroupContext must be used within a InputTextGroupContext.Provider")
    }
    
    return context
}