import { type JSX } from "react"

export function ArchiveIcon({ className }: { className?: string }): JSX.Element {

    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M21 7.78216V16.2169C21 19.165 18.9188 21 15.9736 21H8.02638C5.08119 21 3 19.165 3 16.2159V7.78216C3 4.83405 5.08119 3 8.02638 3H15.9736C18.9188 3 21 4.84281 21 7.78216Z"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 14L11.9982 17L9 14" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round"/>
            <path d="M11.998 17V10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.9336 7H3.05859" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round"/>
        </svg>
    )
}