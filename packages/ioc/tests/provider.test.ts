import { beforeEach, describe, expect, it } from "bun:test"
import {
    CaptiveDependencyError, CircularDependencyError, Inject,
    Injectable, NoMetadataFoundError, ProviderCannotBeResolvedError, ProviderDisposedError, ScopeProvider,
    ServiceCollection,
    ServiceIdentifierNotRegisteredError,
    ServiceProvider
} from "../src"
import { TestDisposable } from "./utils"

describe("ServiceProvider", (): void => {
    let collection: ServiceCollection

    beforeEach((): void => {
        collection = new ServiceCollection()
    })

    describe("singleton", (): void => {
        
        it("should return the same instance on multiple resolves", (): void => {
            @Injectable() class MyService {}
            collection.addSingleton(MyService)
            const provider = collection.build()
            expect(provider.resolve(MyService)).toBe(provider.resolve(MyService))
        })

        it("should resolve a value as singleton", (): void => {
            collection.addValue("port", 3000)
            const provider = collection.build()
            expect(provider.resolve("port")).toBe(provider.resolve("port"))
        })

        it("should resolve a singleton via factory", (): void => {
            @Injectable() class MyService {}
            collection.addSingletonFactory(MyService, () => new MyService())
            const provider = collection.build()
            expect(provider.resolve(MyService)).toBe(provider.resolve(MyService))
        })

        it("should throw captive dependency error when singleton depends on scoped service", (): void => {
            @Injectable() class ScopedDep {}
            @Injectable() class MySingleton { constructor(public dep: ScopedDep) {} }
            collection.addScoped(ScopedDep)
            collection.addSingleton(MySingleton)
            const provider = collection.build()
            expect(() => provider.resolve(MySingleton)).toThrow(CaptiveDependencyError)
        })
    })

    describe("transient", (): void => {
        
        it("should return a new instance on every resolve", (): void => {
            @Injectable() class MyService {}
            collection.addTransient(MyService)
            const provider = collection.build()
            expect(provider.resolve(MyService)).not.toBe(provider.resolve(MyService))
        })

        it("should resolve a transient via factory", (): void => {
            @Injectable() class MyService {}
            collection.addTransientFactory(MyService, () => new MyService())
            const provider = collection.build()
            expect(provider.resolve(MyService)).not.toBe(provider.resolve(MyService))
        })
    })

    describe("resolution", (): void => {
        
        it("should throw ServiceIdentifierNotRegisteredError for unknown identifier", (): void => {
            const provider = collection.build()
            @Injectable() class Unknown {}
            expect(() => provider.resolve(Unknown)).toThrow(ServiceIdentifierNotRegisteredError)
        })

        it("should throw ProviderCannotBeResolvedError for ServiceProvider", (): void => {
            const provider = collection.build()
            expect(() => provider.resolve(ServiceProvider as any)).toThrow(ProviderCannotBeResolvedError)
        })

        it("should throw ProviderCannotBeResolvedError for ScopeProvider", (): void => {
            const provider = collection.build()
            expect(() => provider.resolve(ScopeProvider as any)).toThrow(ProviderCannotBeResolvedError)
        })

        it("should throw CircularDependencyError on direct circular dependency", (): void => {
            @Injectable() class ServiceA { constructor(public a: ServiceA) {} }
            collection.addSingleton(ServiceA)
            const provider = collection.build()
            expect(() => provider.resolve(ServiceA)).toThrow(CircularDependencyError)
        })

        it("should throw CircularDependencyError on indirect circular dependency", (): void => {
            @Injectable() class ServiceB { constructor() {} }
            @Injectable() class ServiceA { constructor(public b: ServiceB) {} }
            ;(ServiceB as any).$inject = [ServiceA]
            collection.addSingleton(ServiceA)
            collection.addSingleton(ServiceB)
            const provider = collection.build()
            expect(() => provider.resolve(ServiceA)).toThrow(CircularDependencyError)
        })

        it("should throw NoMetadataFoundError when constructor has params but no metadata", (): void => {
            class MyService { constructor(public dep: any) {} }
            collection.addSingleton(MyService)
            const provider = collection.build()
            expect(() => provider.resolve(MyService)).toThrow(NoMetadataFoundError)
        })

        it("should resolve a chain of dependencies correctly", (): void => {
            @Injectable() class DepA {}
            @Injectable() class DepB { constructor(public a: DepA) {} }
            @Injectable() class DepC { constructor(public a: DepA, public b: DepB) {} }
            collection.addSingleton(DepA)
            collection.addSingleton(DepB)
            collection.addSingleton(DepC)
            const provider = collection.build()
            const c = provider.resolve(DepC)
            expect(c).toBeInstanceOf(DepC)
            expect(c.b).toBeInstanceOf(DepB)
            expect(c.a).toBeInstanceOf(DepA)
        })

        it("should resolve using @Inject override", (): void => {
            @Injectable() class MyService {
                constructor(@Inject("port") public port: number) {}
            }
            collection.addValue("port", 3000)
            collection.addSingleton(MyService)
            const provider = collection.build()
            expect(provider.resolve(MyService).port).toBe(3000)
        })

        it("should mix reflection and @Inject overrides", (): void => {
            @Injectable() class Dep {}
            @Injectable() class MyService {
                constructor(public dep: Dep, @Inject("port") public port: number) {}
            }
            collection.addSingleton(Dep)
            collection.addValue("port", 3000)
            collection.addSingleton(MyService)
            const provider = collection.build()
            const instance = provider.resolve(MyService)
            expect(instance.dep).toBeInstanceOf(Dep)
            expect(instance.port).toBe(3000)
        })

        it("should cache parameter types after first resolution", (): void => {
            @Injectable() class Dep {}
            @Injectable() class MyService { constructor(public dep: Dep) {} }
            collection.addTransient(Dep)
            collection.addTransient(MyService)
            const provider = collection.build()
            provider.resolve(MyService)
            expect(() => provider.resolve(MyService)).not.toThrow()
        })

        it("should resolve factory with injected dependencies", (): void => {
            @Injectable() class Dep {}
            @Injectable() class MyService { constructor(public dep: Dep) {} }
            collection.addSingleton(Dep)
            collection.addSingletonFactory(MyService, (p) => new MyService(p.resolve(Dep)))
            const provider = collection.build()
            const instance = provider.resolve(MyService)
            expect(instance.dep).toBeInstanceOf(Dep)
        })
    })

    describe("dispose", (): void => {
        
        it("should dispose singleton instances that implement IDisposable", (): void => {
            @Injectable() class MyService extends TestDisposable {}
            collection.addSingleton(MyService)
            const provider = collection.build()
            const instance = provider.resolve(MyService)
            provider.dispose()
            expect(instance.isDisposed()).toBe(true)
        })

        it("should not throw when disposing non-disposable instances", (): void => {
            @Injectable() class MyService {}
            collection.addSingleton(MyService)
            const provider = collection.build()
            provider.resolve(MyService)
            expect(() => provider.dispose()).not.toThrow()
        })

        it("should throw ProviderDisposedError after disposal", (): void => {
            @Injectable() class MyService {}
            collection.addSingleton(MyService)
            const provider = collection.build()
            provider.dispose()
            expect(() => provider.resolve(MyService)).toThrow(ProviderDisposedError)
        })

        it("should not throw when dispose is called multiple times", (): void => {
            const provider = collection.build()
            provider.dispose()
            expect(() => provider.dispose()).not.toThrow()
        })
    })
})