import type { ScopeProvider } from "./scope"

export type ClassType<T = any> = new (...args: any[]) => T

export type ServiceIdentifier<T = any> = 
    | string
    | symbol
    | ClassType<T>

export type ServiceLifetime = "singleton" | "scoped" | "transient"

type ServiceDescriptorBase<T> = {
    identifier: ServiceIdentifier<T>
    lifetime: ServiceLifetime
}

export type ValueServiceDescriptor<T> = Omit<ServiceDescriptorBase<T>, "lifetime"> & {
    value: T
}

export type ProviderFactoryType<T = any> = (provider: IServiceProvider) => T
export type FactoryServiceDescriptor<T> = ServiceDescriptorBase<T> & {
    factory: ProviderFactoryType<T>
}

export type ClassServiceDescriptor<T> = ServiceDescriptorBase<T> & {
    clazz?: ClassType<T> // If absent, identifier must be a ClassType<T>
}

export type ServiceDescriptor<T = any> = 
    | ValueServiceDescriptor<T>
    | FactoryServiceDescriptor<T>
    | ClassServiceDescriptor<T>

export interface IDisposable {
    dispose(): void
    isDisposed(): boolean
}

export interface IServiceProvider extends IDisposable {
    resolve<T>(identifier: ServiceIdentifier<T>): T
    createScope(): ScopeProvider
}
