export type Constructor<TService = any> = new (...args: any[]) => TService

export type ServiceIdentifier<TService = any> = string | symbol | Constructor<TService>

export type ServiceLifetime = "transient" | "scoped" | "singleton"

export interface IServiceProvider {
    resolve<TService = any>(service: ServiceIdentifier<TService>, scope?: IServiceProvider): TService
}

export interface IScopedServiceProvider extends IServiceProvider {
    getOrCreateInstance<TService = any>(
        service: ServiceIdentifier<TService>,
        factory: (scope: IScopedServiceProvider) => TService
    ): TService
}

export type ServiceFactory<TService = any> = (provider: IServiceProvider) => TService

export type ServiceDescriptor<TService = any, TImplementation extends TService = any> = {
    service: ServiceIdentifier<TService>
    implementation?: Constructor<TImplementation>
    factory?: ServiceFactory<TService>
    instance?: TService
    lifetime: ServiceLifetime
}

export interface IDisposable {
    dispose(): void
    isDisposed(): boolean
}