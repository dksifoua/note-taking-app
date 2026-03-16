import type { ServiceIdentifier } from "./types"

export function Injectable(): ClassDecorator {

    return <TFunction extends Function>(target: TFunction): TFunction | void => {
        ;(target as any).$inject = (
            Reflect.getMetadata("design:paramtypes", target) ?? []
        ) as ServiceIdentifier[]
    }
}

export function Inject(identifier: ServiceIdentifier): ParameterDecorator {

    return (target: object, _: string | symbol | undefined, index: number): void => {
        const identifiers: ServiceIdentifier[] = (target as any).$override ?? []
        identifiers[index] = identifier
        
        ;(target as any).$override = identifiers
    }
}