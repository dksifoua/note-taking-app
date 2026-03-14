import type { ServiceIdentifier } from "./types"

export function Inject(token: ServiceIdentifier): ParameterDecorator {
    
    return (target: object, _: string | symbol | undefined, index: number): void => {
        const existing: ServiceIdentifier[] = (target as any).$injectOverrides ?? []
        existing[index] = token
        ;(target as any).$injectOverrides = existing
    }
}