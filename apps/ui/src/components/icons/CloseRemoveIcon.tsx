import { type JSX } from "react"

export function CloseRemoveIcon({ className }: { className?: string }): JSX.Element {

    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L18 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 6L6 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

    )
}