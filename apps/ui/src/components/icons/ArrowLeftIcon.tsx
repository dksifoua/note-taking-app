import { type JSX } from "react"

export function ArrowLeftIcon({ className }: { className?: string }): JSX.Element {

    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M15.7499 20.414L7.33594 12L15.7499 3.586L17.1639 5L10.1639 12L17.1639 19L15.7499 20.414Z"/>
        </svg>
    )
}