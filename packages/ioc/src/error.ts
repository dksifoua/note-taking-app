import type { ClassType, ServiceIdentifier } from "./types"
import { toString } from "./utils"

export class ServiceIdentifierAlreadyRegisteredError extends Error {
    
    public constructor(identifier: ServiceIdentifier) {
        super(`Service identifier '${toString(identifier)}' is already registered.`)
    }
}

export class ServiceIdentifierNotRegisteredError extends Error {

    public constructor(identifier: ServiceIdentifier) {
        super(`Service identifier '${toString(identifier)}' is not registered.`)
    }
}

export class ServiceImplementationNotProvidedError extends Error {

    public constructor(identifier: ServiceIdentifier) {
        super(`Service identifier ${toString(identifier)} is not a class and no class was provided.`)
    }
}

export class CaptiveDependencyError extends Error {

    public constructor(identifier: ServiceIdentifier) {
        super(`Captive dependency detected: singleton is depending on scoped service '${toString(identifier)}'.`)
    }
}

export class ProviderDisposedError extends Error {

    public constructor() {
        super("Scope/Service provider has been disposed and cannot be used.")
    }
}

export class ProviderCannotBeResolvedError extends Error {

    public constructor() {
        super("Cannot resolve a scope/service provider.")
    }
}

export class RequiredScopeProviderError extends Error {

    public constructor(identifier: ServiceIdentifier) {
        super(`Scoped service '${toString(identifier)}' requires a scope provider.`)
    }
}

export class CircularDependencyError extends Error {

    public constructor(resolutionStack: Set<ServiceIdentifier>, identifier: ServiceIdentifier) {
        const stack: string = [...resolutionStack, identifier]
            .map(toString)
            .join(" -> ")
        super(`Circular dependency detected: ${stack}`)
    }
}

export class UnreachableError extends Error {

    public constructor(...x: any) {
        super("Didn't expect to get here, unhandled case: " + x.map(String).join(", "))
    }
}

export class NoMetadataFoundError<T = any> extends Error {

    public constructor(clazz: ClassType<T>) {
        super(
            `No metadata found for '${clazz.name}' which expects ${clazz.length} parameters. ` +
            `Make sure '@Injectable()' is applied and the following are enabled in tsconfig.json compilerOptions: ` +
            `'experimentalDecorators: true' and 'emitDecoratorMetadata: true'.`
        )
    }
}