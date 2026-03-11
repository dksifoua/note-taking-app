import { beforeEach, describe, expect, it } from "bun:test"
import { ServiceCollection } from "../src/collection"
import type { IDisposable, ServiceIdentifier } from "../src/types"
import {
    CannotResolveServiceProviderError,
    CircularDependencyError,
    RequiredScopedServiceProviderError, ServiceDisposedError,
    ServiceNotRegisteredError
} from "../src/error"
import { ScopedServiceProvider, ServiceProvider } from "../src/provider"
import * as test from "node:test"

// ----------------------------------------------------------------------
// Helper Classes and Interfaces for Testing
// ----------------------------------------------------------------------
interface ILogger {
    log(message: string): void
}

class ConsoleLogger implements ILogger {
    
    public log(message: string): void {}
}

class TestDisposable implements IDisposable {
    private disposed = false

    public dispose(): void {
        this.disposed = true
    }
    
    public isDisposed(): boolean {
        return this.disposed
    }
}

class ServiceA {
    
    constructor() {
    }
}

class ServiceB {
    
    constructor(public readonly a?: ServiceA) {
    }
}

class ServiceC {
    
    constructor(public readonly a?: ServiceA) {
    }
}

class ServiceWithInject {
    public static $inject: ServiceIdentifier[] = ["ILogger"]

    constructor(public logger: ILogger) {
    }
}

// ----------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------
describe("ServiceProviderTest", (): void => {
    let services: ServiceCollection

    beforeEach((): void => {
        services = new ServiceCollection()
    })

    describe("resolve basics", (): void => {

        it("should resolve a service registered with constructor", (): void => {
            services.addSingleton(ConsoleLogger)
            const provider = services.build()
            const instance = provider.resolve(ConsoleLogger)
            expect(instance).toBeInstanceOf(ConsoleLogger)
        })
        
        it("should resolve a service registered with string identifier", (): void => {
            const identifier = "ILogger"
            services.addSingleton(identifier, ConsoleLogger)
            const provider = services.build()
            const instance = provider.resolve<ILogger>(identifier)
            expect(instance).toBeInstanceOf(ConsoleLogger)
        })
        
        it("should resolve a service registered with symbol identifier", (): void => {
            const identifier = Symbol("ILogger")
            services.addSingleton(identifier, ConsoleLogger)
            const provider = services.build()
            const instance = provider.resolve<ILogger>(identifier)
            expect(instance).toBeInstanceOf(ConsoleLogger)
        })
        
        it("should resolve a service from a factory", (): void => {
            services.addSingletonFactory("answer", () => 42)
            const provider = services.build()
            const instance = provider.resolve<number>("answer")
            expect(instance).toBe(42)
        })
        
        it("should resolve a pre‑existing instance", (): void => {
            const obj = { value: 123 }
            services.addSingletonInstance("obj", obj)
            const provider = services.build()
            const instance = provider.resolve<typeof obj>("obj")
            expect(instance).toBe(obj)
        })

        it("should throw if service not registered", (): void => {
            const provider = services.build()
            expect(() => provider.resolve("missing")).toThrow(ServiceNotRegisteredError)
        })
        
        it("should throw when trying to resolve the provider itself", (): void => {
            const provider = services.build()
            expect(() => provider.resolve(ServiceProvider)).toThrow(CannotResolveServiceProviderError)
            expect(() => provider.resolve(ScopedServiceProvider)).toThrow(CannotResolveServiceProviderError)
        })
    })

    describe("resolve lifetimes", (): void => {
        
        it("should create new instances for transient each time", (): void => {
            services.addTransient(ConsoleLogger)
            const provider = services.build()
            
            const a = provider.resolve(ConsoleLogger)
            const b = provider.resolve(ConsoleLogger)
            expect(a).not.toBe(b)
        })
        
        it("should share instance within a scope for scoped", (): void => {
            services.addScoped(ConsoleLogger)
            const provider = services.build()
            const scope = provider.createScope()

            const a = scope.resolve(ConsoleLogger)
            const b = scope.resolve(ConsoleLogger)
            expect(a).toBe(b)
        })
        
        it("should create different scoped instances in different scopes", (): void => {
            services.addScoped(ConsoleLogger)
            const provider = services.build()
            const scope1 = provider.createScope()
            const scope2 = provider.createScope()

            const a = scope1.resolve(ConsoleLogger)
            const b = scope2.resolve(ConsoleLogger)
            expect(a).not.toBe(b)
        })
        
        it("should throw if scoped service resolved without a scope", (): void => {
            services.addScoped(ConsoleLogger)
            const provider = services.build()
            
            expect(() => provider.resolve(ConsoleLogger)).toThrow(RequiredScopedServiceProviderError)
        })
    })
    
    describe("dependency injection", (): void => {
        
        it("should inject dependencies using $inject property", (): void => {
            services.addSingleton<ILogger, ConsoleLogger>("ILogger", ConsoleLogger)
            services.addSingleton(ServiceWithInject)
            const provider = services.build()
            
            const instance = provider.resolve(ServiceWithInject)
            expect(instance.logger).toBeInstanceOf(ConsoleLogger)
        })
        
        it("should inject dependencies using reflection", (): void => {
            services.addSingleton(ServiceA)
            services.addSingleton(ServiceB)
            services.addSingleton(ServiceC)
            const provider = services.build()

            const a = provider.resolve(ServiceA)
            const b = provider.resolve(ServiceB)
            const c = provider.resolve(ServiceC)
            expect(a).toBe(b.a!)
            expect(a).toBe(c.a!)
        })
        
        it("should throw if constructor expects non registered params", (): void => {
            class X { constructor(public x: {}) {} }
            
            services.addTransient(X)
            const provider = services.build()
            expect(() => provider.resolve(X)).toThrow(ServiceNotRegisteredError)
        })
    })
    
    describe("circular dependency detection", (): void => {
        
        it("should detect direct circular dependency", (): void => {
            class X { constructor(public y: Y) {} }
            class Y { constructor(public x: X) {} }
            
            services.addTransient(X)
            services.addTransient(Y)
            const provider = services.build()
            expect(() => provider.resolve(X)).toThrow(CircularDependencyError)
        })
        
        it("should detect longer cycle and format stack clearly", (): void => {
            class X { constructor(public y: Y) {} }
            class Y { constructor(public z: Z) {} }
            class Z { constructor(public x: X) {} }
            
            services.addTransient(X)
            services.addTransient(Y)
            services.addTransient(Z)
            const provider = services.build()
            expect(() => provider.resolve(X)).toThrow(/X -> Y -> Z -> X/)
        })
        
        it("should not throw for non‑circular graph", (): void => {
            class A { constructor(public b: B) {} }
            class B { constructor() {} }

            services.addTransient(A)
            services.addTransient(B)
            const provider = services.build()
            expect(() => provider.resolve(A)).not.toThrow()
        })
    })
    
    describe("post‑disposal usage", (): void => {
        
        it("should throw when resolving after provider is disposed", (): void => {
            services.addSingleton(ConsoleLogger)
            
            const provider = services.build()
            provider.dispose()
            expect(() => provider.resolve(ConsoleLogger)).toThrow(ServiceDisposedError)
        })
        
        it("should throw when creating a scope after provider is disposed", (): void => {
            services.addSingleton(ConsoleLogger)
            
            const provider = services.build()
            provider.dispose()
            expect(() => provider.createScope()).toThrow(ServiceDisposedError)
        })
    })
    
    describe("singleton disposal", (): void => {
        
        it("should call dispose on singleton instances that implement IDisposable", (): void => {
            services.addSingleton(TestDisposable)
            
            const provider = services.build()
            const instance = provider.resolve(TestDisposable)
            expect(instance.isDisposed()).toBe(false)
            provider.dispose()
            expect(instance.isDisposed()).toBe(true)
        })
        
        it("should not throw if singleton does not implement dispose", (): void => {
            services.addSingleton(ConsoleLogger)
            
            const provider = services.build()
            expect(() => provider.dispose()).not.toThrow()
        })
    })
    
    describe("caching parameter", (): void => {
        
        test.todo("should cache constructor parameter types after first resolution", (): void => {})
    })
    
    describe("scoped provider", (): void => {
        
        it("should dispose scoped instances when scope is disposed", (): void => {
            services.addScoped(TestDisposable)

            const provider = services.build()
            const scope = provider.createScope()
            const instance = scope.resolve(TestDisposable)
            expect(instance.isDisposed()).toBe(false)
            scope.dispose()
            expect(instance.isDisposed()).toBe(true)
        })
        
        it("should not allow resolves after scope is disposed", (): void => {
            services.addScoped(ConsoleLogger)

            const provider = services.build()
            const scope = provider.createScope()
            scope.dispose()
            expect(() => scope.resolve(TestDisposable)).toThrow(ServiceDisposedError)
        })
        
        test.todo("should isolate partial failures during scoped service creation")
        test.todo("should not leak partially created dependencies when a factory throws")
    })
    
    describe("type safety (runtime behavior)", (): void => {
        
        it("should retrieve the correct descriptor for a given service", (): void => {
            services.addSingleton("foo", ConsoleLogger)
            
            const provider = services.build()
            const foo = provider.resolve("foo")
            expect(foo).toBeInstanceOf(ConsoleLogger)
        })
    })
})