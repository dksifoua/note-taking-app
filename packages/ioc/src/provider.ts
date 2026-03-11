import type {
    Constructor,
    IDisposable,
    IScopedServiceProvider,
    IServiceProvider,
    ServiceDescriptor,
    ServiceIdentifier
} from "./types"
import {
    CannotResolveServiceProviderError,
    CircularDependencyError,
    NoMetadataFoundError,
    RequiredScopedServiceProviderError,
    ServiceDisposedError,
    ServiceNotRegisteredError
} from "./error"
import { ReflectionClass } from "@deepkit/type"

export class ServiceProvider implements IServiceProvider, IDisposable {
    private readonly descriptors: Map<ServiceIdentifier, ServiceDescriptor>
    private readonly singletons: Map<ServiceIdentifier, any>
    private readonly resolutionStack: Set<ServiceIdentifier>
    private readonly paramCache: WeakMap<Constructor, ServiceIdentifier[]>
    private disposed: boolean

    public constructor(descriptors: Array<ServiceDescriptor>) {
        this.descriptors = new Map<ServiceIdentifier, ServiceDescriptor>()
        this.singletons = new Map<ServiceIdentifier, any>()
        this.resolutionStack = new Set<ServiceIdentifier>()
        this.paramCache = new WeakMap<Constructor, ServiceIdentifier[]>()
        this.disposed = false

        descriptors.forEach((descriptor: ServiceDescriptor): void => {
            this.descriptors.set(descriptor.service, descriptor)
        })
    }

    public isDisposed(): boolean {
        return this.disposed
    }

    public createScope(): ScopedServiceProvider {
        this.ensureNotDisposed()
        return new ScopedServiceProvider(this)
    }

    public resolve<TService>(
        service: ServiceIdentifier<TService>,
        scope?: IScopedServiceProvider
    ): TService {
        this.ensureNotDisposed()

        if (service === ServiceProvider || service === ScopedServiceProvider) {
            throw new CannotResolveServiceProviderError("Cannot resolve a service provider.")
        }

        const descriptor = this.descriptors.get(service) as ServiceDescriptor<TService> | undefined
        if (!descriptor) {
            throw new ServiceNotRegisteredError(`Service not registered: ${typeof service === "function" ? service.name : String(service)}`)
        }

        // Check for circular dependency
        if (this.resolutionStack.has(service)) {
            const stack = Array.from(this.resolutionStack)
                .map((s: ServiceIdentifier): string => typeof s === "function" ? s.name : String(s))
                .concat(typeof service === "function" ? service.name : String(service))
                .join(" -> ")
            throw new CircularDependencyError(`Circular dependency detected: ${stack}`)
        }

        let instance: TService
        switch (descriptor.lifetime) {
            case "scoped":
                if (scope === undefined) {
                    throw new RequiredScopedServiceProviderError("Scope is required for scoped lifetime")
                }
                instance = scope.getOrCreateInstance(service, (s: IScopedServiceProvider): TService => this.createInstance(descriptor, s))
                break
            case "transient":
                instance = this.createInstance(descriptor, scope)
                break
            case "singleton":
                if (descriptor.instance !== undefined) {
                    return descriptor.instance as TService
                }

                if (this.singletons.has(service)) {
                    return this.singletons.get(service) as TService
                }

                instance = this.createInstance(descriptor)
                this.singletons.set(service, instance)
                break
            default:
                throw new Error(`Invalid lifetime: ${descriptor.lifetime}`)
        }

        return instance
    }

    public dispose(): void {
        if (this.disposed) {
            return
        }

        for (const instance of this.singletons.values()) {
            if (instance && typeof instance.dispose === "function") {
                instance.dispose()
            }
        }

        this.descriptors.clear()
        this.singletons.clear()
        this.resolutionStack.clear()
        this.disposed = true
    }

    private ensureNotDisposed(): void {
        if (this.disposed) {
            throw new ServiceDisposedError("Cannot use a disposed ServiceProvider.");
        }
    }

    private createInstance<TService>(
        descriptor: ServiceDescriptor<TService>,
        scope?: IScopedServiceProvider
    ): TService {
        this.resolutionStack.add(descriptor.service)

        try {
            if (descriptor.factory !== undefined) {
                return descriptor.factory(scope ?? this)
            }

            let implementation: Constructor<TService>
            switch (true) {
                case descriptor.implementation !== undefined:
                    implementation = descriptor.implementation
                    break
                case typeof descriptor.service === "function":
                    implementation = descriptor.service as Constructor<TService>
                    break
                default:
                    throw new Error(`Invalid service type: ${typeof descriptor.service}`)
            }

            const services: ServiceIdentifier<TService>[] = this.getParameterTypes(implementation)
            const dependencies: TService[] = services.map((service: ServiceIdentifier<TService>): TService => {
                return this.resolve(service, scope)
            })

            return new implementation(...dependencies)
        } finally {
            this.resolutionStack.delete(descriptor.service)
        }
    }

    private getParameterTypes<TService>(implementation: Constructor<TService>): ServiceIdentifier<TService>[] {
        const cached = this.paramCache.get(implementation);
        if (cached) {
            return cached
        }

        if ((implementation as any).$inject) {
            const types = (implementation as any).$inject as ServiceIdentifier[]
            this.paramCache.set(implementation, types)
            return types
        }

        let params: ServiceIdentifier[] = []
        const reflection = ReflectionClass.from<TService>(implementation)
        if (reflection.hasMethod("constructor")) {
            reflection.getPropertiesDeclaredInConstructor()
                .map(param => param
                    .getResolvedReflectionClass()
                    .getClassType() as ServiceIdentifier<TService>)
                .forEach(param => params.push(param))
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

export class ScopedServiceProvider implements IScopedServiceProvider, IDisposable {
    private readonly provider: IServiceProvider
    private readonly scopes: Map<ServiceIdentifier, any>
    private disposed: boolean

    public constructor(provider: IServiceProvider) {
        this.provider = provider
        this.scopes = new Map<ServiceIdentifier, any>()
        this.disposed = false
    }

    public isDisposed(): boolean {
        return this.disposed
    }

    public resolve<TService = any>(service: ServiceIdentifier<TService>, _?: IServiceProvider): TService {
        this.ensureNotDisposed()
        return this.provider.resolve(service, this)
    }

    public dispose(): void {
        if (this.disposed) {
            return
        }

        for (const instance of this.scopes.values()) {
            if (instance && typeof instance.dispose === 'function') {
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

        let instance: TService

        // Use a temporary scope to isolate failures during creation
        const temporaryScope = new ScopedServiceProvider(this.provider)
        try {
            instance = factory(temporaryScope)
        } catch (error) {
            temporaryScope.dispose()
            throw error
        }

        // Transfer successfully created dependencies from tempScope to this scope
        for (const [key, value] of temporaryScope.scopes.entries()) {
            this.scopes.set(key, value)
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