import "reflect-metadata"
import type { ClassType, IServiceProvider, ServiceDescriptor, ServiceIdentifier, ServiceLifetime } from "./types"
import { ScopeProvider } from "./scope"
import {
    CaptiveDependencyError,
    CircularDependencyError,
    NoMetadataFoundError,
    ProviderCannotBeResolvedError,
    ProviderDisposedError,
    RequiredScopeProviderError,
    ServiceIdentifierNotRegisteredError,
    UnreachableError
} from "./error"

export class ServiceProvider implements IServiceProvider {
    private readonly descriptors: Map<ServiceIdentifier, ServiceDescriptor>
    private readonly singletons: Map<ServiceIdentifier, any>
    private readonly paramTypeCache: WeakMap<ClassType, ServiceIdentifier[]>
    private disposed: boolean

    public constructor(descriptors: ServiceDescriptor[]) {
        this.descriptors = new Map(descriptors.map(d => [d.identifier, d]))
        this.singletons = new Map()
        this.paramTypeCache = new WeakMap()
        this.disposed = false
    }

    public dispose(): void {
        if (this.disposed) {
            return
        }
        this.disposed = true

        for (const instance of this.singletons.values()) {
            if (instance && typeof instance.dispose === "function") {
                instance.dispose()
            }
        }

        this.singletons.clear()
    }

    public isDisposed(): boolean {
        return this.disposed
    }

    public createScope(): ScopeProvider {
        return new ScopeProvider(this)
    }

    public resolve<T>(identifier: ServiceIdentifier<T>, scope?: ScopeProvider): T {
        this.ensureNotDisposed()

        if (identifier === ServiceProvider || identifier === ScopeProvider) {
            throw new ProviderCannotBeResolvedError()
        }

        return this.resolveInternal(identifier, new Set(), false, scope)
    }

    private resolveInternal<T>(
        identifier: ServiceIdentifier<T>,
        resolutionStack: Set<ServiceIdentifier>,
        isSingletonContext: boolean,
        scope?: ScopeProvider
    ): T {
        const descriptor: ServiceDescriptor<T> | undefined = this.descriptors.get(identifier)
        if (!descriptor) {
            throw new ServiceIdentifierNotRegisteredError(identifier)
        }

        // Check for circular dependency
        if (resolutionStack.has(identifier)) {
            throw new CircularDependencyError(resolutionStack, identifier)
        }

        // Captive dependency: singleton depending on a scoped service
        // would cause the scoped instance to outlive its intended scope
        const lifetime = this.getLifetime(descriptor)
        if (isSingletonContext && lifetime === "scoped") {
            throw new CaptiveDependencyError(identifier)
        }
        
        switch (lifetime) {
            case "singleton": {
                if ("value" in descriptor) {
                    return descriptor.value as T
                }
                
                if (this.singletons.has(identifier)) {
                    return this.singletons.get(identifier) as T
                }

                // Singletons resolve without a scope — any scoped dependency is a captive
                const instance: T = this.createInstance(descriptor, resolutionStack, true)
                this.singletons.set(identifier, instance)
                return instance
            }
            case "scoped": {
                if (scope === undefined) {
                    throw new RequiredScopeProviderError(identifier)
                }
                
                return scope.getOrCreateInstance(identifier, (s: ScopeProvider): T =>
                    this.createInstance(descriptor, resolutionStack, false, s)
                )
            }
            case "transient": {
                return this.createInstance(descriptor, resolutionStack, isSingletonContext, scope)
            }
            default: {
                throw new UnreachableError(lifetime)
            }
        }
    }
    
    private createInstance<T>(
        descriptor: ServiceDescriptor<T>,
        resolutionStack: Set<ServiceIdentifier>,
        isSingletonContext: boolean,
        scope?: ScopeProvider
    ): T {
        if ("factory" in descriptor) {
            return descriptor.factory(scope ?? this)
        }
        const currentStack = new Set([...resolutionStack, descriptor.identifier])
        
        const clazz = (function <T>(descriptor: ServiceDescriptor<T>): ClassType<T> {
            switch (true) {
                case "clazz" in descriptor && descriptor.clazz !== undefined: {
                    return descriptor.clazz
                }
                case typeof descriptor.identifier === "function": {
                    return descriptor.identifier as ClassType<T>
                }
                default: {
                    throw new UnreachableError(descriptor)
                }
            }
        })(descriptor)

        const paramTypes: ServiceIdentifier<T>[] = this.getParameterTypes(clazz)
        const dependencies: T[] = paramTypes.map((service: ServiceIdentifier<T>): T =>
            this.resolveInternal(service, currentStack, isSingletonContext, scope)
        )

        return new clazz(...dependencies)
    }
    
    private getParameterTypes<T>(clazz: ClassType<T>): ServiceIdentifier<T>[] {
        const cached: ServiceIdentifier[] | undefined = this.paramTypeCache.get(clazz)
        if (cached !== undefined) {
            return cached
        }

        const inject: ServiceIdentifier[] = (clazz as any).$inject ?? []
        const override: ServiceIdentifier[] = (clazz as any).$override ?? []

        if (inject.length === 0 && clazz.length > 0) {
            throw new NoMetadataFoundError(clazz)
        }
        
        const paramTypes = inject.map((identifier: ServiceIdentifier, index: number): ServiceIdentifier =>
            override[index] !== undefined ? override[index] : identifier
        )
        this.paramTypeCache.set(clazz, paramTypes)
        return paramTypes
    }

    private getLifetime(descriptor: ServiceDescriptor): ServiceLifetime {
        if ("value" in descriptor) {
            return "singleton"
        }
        
        return descriptor.lifetime
    }

    private ensureNotDisposed(): void {
        if (this.disposed) {
            throw new ProviderDisposedError()
        }
    }
}