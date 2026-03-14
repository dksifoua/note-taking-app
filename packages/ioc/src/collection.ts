import type {
    Constructor,
    IServiceProvider,
    ServiceDescriptor,
    ServiceFactory,
    ServiceIdentifier,
    ServiceLifetime
} from "./types"
import { ServiceProvider } from "./provider"
import { NoImplementationProvidedError, ServiceAlreadyRegisteredError } from "./error"

export class ServiceCollection {
    private readonly descriptors: Array<ServiceDescriptor>

    public constructor() {
        this.descriptors = []
    }

    private add<TService, TImplementation extends TService>(
        service: ServiceIdentifier<TService>,
        lifetime: ServiceLifetime,
        implementation?: Constructor<TImplementation>,
    ): void {
        if (typeof service !== "function" && !implementation) {
            throw new NoImplementationProvidedError(`Service ${String(service)} must be a constructor when no implementation is provided.`)
        }

        if (this.descriptors.some((descriptor: ServiceDescriptor): boolean => descriptor.service === service)) {
            throw new ServiceAlreadyRegisteredError(`Service ${String(service)} is already registered.`)
        }
        
        this.descriptors.push({ service, implementation, lifetime })
    }

    private addFactory<TService>(
        service: ServiceIdentifier<TService>,
        lifetime: ServiceLifetime,
        factory: ServiceFactory<TService>,
    ): void {
        if (this.descriptors.some((descriptor: ServiceDescriptor): boolean => descriptor.service === service)) {
            throw new ServiceAlreadyRegisteredError(`Service ${String(service)} is already registered.`)
        }
        
        this.descriptors.push({ service, factory, lifetime })
    }

    private addInstance<TService>(
        service: ServiceIdentifier<TService>,
        instance: TService,
    ): void {
        if (this.descriptors.some((descriptor: ServiceDescriptor): boolean => descriptor.service === service)) {
            throw new ServiceAlreadyRegisteredError(`Service ${String(service)} is already registered.`)
        }
        
        this.descriptors.push({ service, instance, lifetime: "singleton" })
    }

    public addScoped<TService, TImplementation extends TService>(
        service: ServiceIdentifier<TService>,
        implementation?: Constructor<TImplementation>,
    ): void {
        this.add(service, "scoped", implementation)
    }

    public addScopedFactory<TService>(
        service: ServiceIdentifier<TService>,
        factory: ServiceFactory<TService>,
    ): void {
        this.addFactory(service, "scoped", factory)
    }

    public addTransient<TService, TImplementation extends TService>(
        service: ServiceIdentifier<TService>,
        implementation?: Constructor<TImplementation>,
    ): void {
        this.add(service, "transient", implementation)
    }

    public addTransientFactory<TService>(
        service: ServiceIdentifier<TService>,
        factory: ServiceFactory<TService>,
    ): void {
        this.addFactory(service, "transient", factory)
    }

    public addSingleton<TService, TImplementation extends TService>(
        service: ServiceIdentifier<TService>,
        implementation?: Constructor<TImplementation>,
    ): void {
        this.add(service, "singleton", implementation)
    }

    public addSingletonFactory<TService>(
        service: ServiceIdentifier<TService>,
        factory: ServiceFactory<TService>,
    ): void {
        this.addFactory(service, "singleton", factory)
    }

    public addSingletonInstance<TService>(
        service: ServiceIdentifier<TService>,
        instance: TService,
    ): void {
        this.addInstance(service, instance)
    }

    public build(): IServiceProvider {
        return new ServiceProvider([...this.descriptors])
    }
}