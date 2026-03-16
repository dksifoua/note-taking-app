import type { ClassType, ProviderFactoryType, ServiceDescriptor, ServiceIdentifier, ServiceLifetime } from "./types"
import { ServiceIdentifierAlreadyRegisteredError, ServiceImplementationNotProvidedError } from "./error"
import { isClass } from "./utils"
import { ServiceProvider } from "./provider"

export class ServiceCollection {
    private readonly descriptors: Map<ServiceIdentifier, ServiceDescriptor>

    public constructor() {
        this.descriptors = new Map()
    }
    
    public build(): ServiceProvider {
        return new ServiceProvider([...this.descriptors.values()])
    }

    public addValue<T>(identifier: ServiceIdentifier<T>, value: T): ServiceCollection {
        this.register({ identifier, value })
        return this
    }
    
    public addSingleton<T>(identifier: ServiceIdentifier<T>, clazz?: ClassType<T>): ServiceCollection {
        this.addClass<T>(identifier, "singleton", clazz)
        return this
    }

    public addSingletonFactory<T>(identifier: ServiceIdentifier<T>, factory: ProviderFactoryType<T>): ServiceCollection {
        this.addFactory<T>(identifier, "singleton", factory)
        return this
    }

    public addScoped<T>(identifier: ServiceIdentifier<T>, clazz?: ClassType<T>): ServiceCollection {
        this.addClass<T>(identifier, "scoped", clazz)
        return this
    }

    public addScopedFactory<T>(identifier: ServiceIdentifier<T>, factory: ProviderFactoryType<T>): ServiceCollection {
        this.addFactory<T>(identifier, "scoped", factory)
        return this
    }

    public addTransient<T>(identifier: ServiceIdentifier<T>, clazz?: ClassType<T>): ServiceCollection {
        this.addClass<T>(identifier, "transient", clazz)
        return this
    }

    public addTransientFactory<T>(identifier: ServiceIdentifier<T>, factory: ProviderFactoryType<T>): ServiceCollection {
        this.addFactory<T>(identifier, "transient", factory)
        return this
    }

    public register<T>(descriptor: ServiceDescriptor<T>): ServiceCollection {
        const identifier = descriptor.identifier
        if (this.descriptors.has(identifier)) {
            throw new ServiceIdentifierAlreadyRegisteredError(identifier)
        }
        this.descriptors.set(identifier, descriptor)
        return this
    }

    private addFactory<T>(identifier: ServiceIdentifier<T>, lifetime: ServiceLifetime, factory: ProviderFactoryType<T>): void {
        this.register({ identifier, lifetime, factory })
    }

    private addClass<T>(identifier: ServiceIdentifier<T>, lifetime: ServiceLifetime, clazz?: ClassType<T>): void {
        if (!isClass(identifier) && clazz === undefined) {
            throw new ServiceImplementationNotProvidedError(identifier)
        }
        
        this.register({ identifier, lifetime, clazz })
    }
}