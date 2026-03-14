import type {
    Constructor,
    IScopedServiceProvider,
    IServiceProvider,
    ServiceDescriptor,
    ServiceIdentifier
} from "./types"
import {
    CannotResolveServiceProviderError,
    CaptiveDependencyError,
    CircularDependencyError,
    NoMetadataFoundError,
    RequiredScopedServiceProviderError,
    ServiceDisposedError,
    ServiceNotRegisteredError
} from "./error"
import { ReflectionClass } from "@deepkit/type"

export class ServiceProvider implements IServiceProvider {
    private readonly descriptors: Map<ServiceIdentifier, ServiceDescriptor>
    private readonly singletons: Map<ServiceIdentifier, any>
    private readonly paramCache: WeakMap<Constructor, ServiceIdentifier[]>
    private disposed: boolean

    public constructor(descriptors: Array<ServiceDescriptor>) {
        this.descriptors = new Map()
        this.singletons = new Map()
        this.paramCache = new WeakMap()
        this.disposed = false

        for (const descriptor of descriptors) {
            this.descriptors.set(descriptor.service, descriptor)
        }
    }

    public isDisposed(): boolean {
        return this.disposed
    }

    public createScope(): IScopedServiceProvider {
        this.ensureNotDisposed()
        return new ScopedServiceProvider(this)
    }

    public resolve<TService>(
        service: ServiceIdentifier<TService>,
        scope?: IScopedServiceProvider
    ): TService {
        return this.resolveInternal(service, new Set(), false, scope)
    }

    private resolveInternal<TService>(
        service: ServiceIdentifier<TService>,
        resolutionStack: Set<ServiceIdentifier>,
        isSingletonContext: boolean,
        scope?: IScopedServiceProvider,
    ): TService {
        this.ensureNotDisposed()

        if (service === ServiceProvider || service === ScopedServiceProvider) {
            throw new CannotResolveServiceProviderError("Cannot resolve a service provider.")
        }

        const descriptor = this.descriptors.get(service) as ServiceDescriptor<TService> | undefined
        if (!descriptor) {
            throw new ServiceNotRegisteredError(`Service not registered: ${
                typeof service === "function" ? service.name : String(service)
            }`)
        }

        // Check for circular dependency
        if (resolutionStack.has(service)) {
            const stack: string = [...resolutionStack, service]
                .map((s: ServiceIdentifier): string => typeof s === "function" ? s.name : String(s))
                .join(" -> ")
            throw new CircularDependencyError(`Circular dependency detected: ${stack}`)
        }

        // Captive dependency: singleton depending on a scoped service
        // would cause the scoped instance to outlive its intended scope
        if (isSingletonContext && descriptor.lifetime === "scoped") {
            const name: string = typeof service === "function" ? service.name : String(service)
            throw new CaptiveDependencyError(
                `Captive dependency detected: singleton is depending on scoped service '${name}'.`
            )
        }

        switch (descriptor.lifetime) {
            case "scoped": {
                if (scope === undefined) {
                    throw new RequiredScopedServiceProviderError("Scope is required for scoped lifetime")
                }
                return scope.getOrCreateInstance(service, (s: IScopedServiceProvider): TService =>
                    this.createInstance(descriptor, resolutionStack, false, s)
                )
            }

            case "transient": {
                return this.createInstance(descriptor, resolutionStack, isSingletonContext, scope)
            }

            case "singleton": {
                if (descriptor.instance !== undefined) {
                    return descriptor.instance as TService
                }

                if (this.singletons.has(service)) {
                    return this.singletons.get(service) as TService
                }

                // Singletons resolve without a scope — any scoped dependency is a captive
                const instance: TService = this.createInstance(descriptor, resolutionStack, true)
                this.singletons.set(service, instance)
                return instance
            }

            default: {
                throw new Error(`Invalid lifetime: ${descriptor.lifetime}`)
            }
        }
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

    private ensureNotDisposed(): void {
        if (this.disposed) {
            throw new ServiceDisposedError("Cannot use a disposed ServiceProvider.");
        }
    }

    private createInstance<TService>(
        descriptor: ServiceDescriptor<TService>,
        resolutionStack: Set<ServiceIdentifier>,
        isSingletonContext: boolean,
        scope?: IScopedServiceProvider,
    ): TService {
        if (descriptor.factory !== undefined) {
            return descriptor.factory(scope ?? this)
        }

        const currentStack = new Set([...resolutionStack, descriptor.service])

        let implementation: Constructor<TService>
        if (descriptor.implementation !== undefined) {
            implementation = descriptor.implementation
        } else if (typeof descriptor.service === "function") {
            implementation = descriptor.service as Constructor<TService>
        } else {
            throw new Error(`No implementation found for: ${String(descriptor.service)}`)
        }

        const paramTypes: ServiceIdentifier<TService>[] = this.getParameterTypes(implementation)
        const dependencies: TService[] = paramTypes.map((service: ServiceIdentifier<TService>) =>
            this.resolveInternal(service, currentStack, isSingletonContext, scope)
        )

        return new implementation(...dependencies)
    }

    private getParameterTypes<TService>(implementation: Constructor<TService>): ServiceIdentifier<TService>[] {
        const cached: ServiceIdentifier[] | undefined = this.paramCache.get(implementation);
        if (cached) {
            return cached
        }

        if ((implementation as any).$inject) {
            const types = (implementation as any).$inject as ServiceIdentifier[]
            this.paramCache.set(implementation, types)
            return types
        }

        const overrides: ServiceIdentifier[] = (implementation as any).$injectOverrides ?? []
        let params: ServiceIdentifier[] = []
        
        const reflection = ReflectionClass.from<TService>(implementation)
        if (reflection.hasMethod("constructor")) {
            reflection.getPropertiesDeclaredInConstructor()
                .forEach((param, index) => {
                    if (overrides[index] !== undefined) {
                        params[index] = overrides[index]
                    } else {
                        params[index] = param
                            .getResolvedReflectionClass()
                            .getClassType() as ServiceIdentifier
                    }
                })
        }
        if (params.length === 0 && implementation.length > 0) {
            throw new NoMetadataFoundError(
                `No metadata found for ${implementation.name} which expects ${implementation.length} parameters. ` +
                `Please add decorators, define a $inject property, or use a factory.`
            )
        }

        this.paramCache.set(implementation, params)
        return params
    }
}

export class ScopedServiceProvider implements IScopedServiceProvider {
    private readonly provider: ServiceProvider
    private readonly scopes: Map<ServiceIdentifier, any>
    private disposed: boolean

    public constructor(provider: ServiceProvider) {
        this.provider = provider
        this.scopes = new Map()
        this.disposed = false
    }

    public createScope(): IScopedServiceProvider {
        throw new Error("Cannot create scope from scoped service provider")
    }

    public isDisposed(): boolean {
        return this.disposed
    }

    public resolve<TService>(service: ServiceIdentifier<TService>): TService {
        this.ensureNotDisposed()
        return this.provider.resolve(service, this)
    }

    public dispose(): void {
        if (this.disposed) {
            return
        }

        for (const instance of this.scopes.values()) {
            if (instance && typeof instance.dispose === "function") {
                instance.dispose()
            }
        }

        this.scopes.clear()
        this.disposed = true
    }

    public getOrCreateInstance<TService>(
        service: ServiceIdentifier<TService>,
        factory: (scope: IScopedServiceProvider) => TService
    ): TService {
        this.ensureNotDisposed()

        if (this.scopes.has(service)) {
            return this.scopes.get(service) as TService
        }

        const temporaryScope = new ScopedServiceProvider(this.provider)
        let instance: TService

        try {
            instance = factory(temporaryScope)
        } catch (error) {
            // Dispose partial dependencies resolved during the failed attempt
            temporaryScope.dispose()
            throw error
        }

        // Transfer successfully created dependencies into this scope
        for (const [key, value] of temporaryScope.scopes.entries()) {
            if (!this.scopes.has(key)) {
                this.scopes.set(key, value)
            }
        }

        this.scopes.set(service, instance)
        return instance
    }

    private ensureNotDisposed(): void {
        if (this.disposed) {
            throw new ServiceDisposedError("Cannot use a disposed ScopedServiceProvider.")
        }
    }
}