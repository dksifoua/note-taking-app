import type { ServiceProvider } from "./provider"
import type { IServiceProvider, ServiceIdentifier } from "./types"
import { ProviderDisposedError } from "./error"

export class ScopeProvider implements IServiceProvider {
    private readonly provider: ServiceProvider
    private readonly scopes: Map<ServiceIdentifier, any>
    private disposed: boolean

    public constructor(provider: ServiceProvider) {
        this.provider = provider
        this.scopes = new Map()
        this.disposed = false
    }

    public dispose(): void {
        if (this.disposed) {
            return
        }
        this.disposed = true

        for (const instance of this.scopes.values()) {
            if (instance && typeof instance.dispose === "function") {
                instance.dispose()
            }
        }

        this.scopes.clear()
    }
    
    public isDisposed(): boolean {
        return this.disposed
    }

    public resolve<T>(service: ServiceIdentifier<T>): T {
        this.ensureNotDisposed()
        return this.provider.resolve(service, this)
    }

    public createScope(): ScopeProvider {
        return new ScopeProvider(this.provider)
    }
    
    public getOrCreateInstance<T>(identifier: ServiceIdentifier<T>, createInstance: (scope: ScopeProvider) => T): T {
        this.ensureNotDisposed()
        
        if (this.scopes.has(identifier)) {
            return this.scopes.get(identifier) as T
        }
        
        const temporaryScope = new ScopeProvider(this.provider)
        let instance: T
        try {
            instance = createInstance(temporaryScope)
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

        this.scopes.set(identifier, instance)
        return instance
    }

    private ensureNotDisposed(): void {
        if (this.disposed) {
            throw new ProviderDisposedError()
        }
    }
}