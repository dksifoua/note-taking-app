import { beforeEach, describe, expect, it } from "bun:test"
import { Injectable, ProviderDisposedError, RequiredScopeProviderError, ServiceCollection } from "../src"
import { TestDisposable } from "./utils"

describe("ScopeProvider", (): void => {
    let collection: ServiceCollection

    beforeEach((): void => {
        collection = new ServiceCollection()
    })

    describe("scoped", (): void => {
        
        it("should return the same instance within the same scope", (): void => {
            @Injectable() class MyService {}
            collection.addScoped(MyService)
            const scope = collection.build().createScope()
            expect(scope.resolve(MyService)).toBe(scope.resolve(MyService))
        })

        it("should return different instances across different scopes", (): void => {
            @Injectable() class MyService {}
            collection.addScoped(MyService)
            const provider = collection.build()
            expect(provider.createScope().resolve(MyService)).not.toBe(provider.createScope().resolve(MyService))
        })

        it("should throw RequiredScopeProviderError when resolving scoped service without scope", (): void => {
            @Injectable() class MyService {}
            collection.addScoped(MyService)
            const provider = collection.build()
            expect(() => provider.resolve(MyService)).toThrow(RequiredScopeProviderError)
        })

        it("should resolve scoped service that depends on another scoped service", (): void => {
            @Injectable() class DepA {}
            @Injectable() class DepB { constructor(public a: DepA) {} }
            collection.addScoped(DepA)
            collection.addScoped(DepB)
            const scope = collection.build().createScope()
            const b = scope.resolve(DepB)
            expect(b).toBeInstanceOf(DepB)
            expect(b.a).toBeInstanceOf(DepA)
        })
    })

    describe("partial failure isolation", (): void => {
        
        it("should dispose partial dependencies when factory throws", (): void => {
            @Injectable() class DepA extends TestDisposable {}
            @Injectable() class FailingService { constructor(public a: DepA) { throw new Error("failed") } }
            collection.addScoped(DepA)
            collection.addScoped(FailingService)
            const scope = collection.build().createScope()
            expect(() => scope.resolve(FailingService)).toThrow("failed")
        })

        it("should not leak failed dependencies into the scope", (): void => {
            @Injectable() class DepA extends TestDisposable {}
            @Injectable() class FailingService { constructor(public a: DepA) { throw new Error("failed") } }
            collection.addScoped(DepA)
            collection.addScoped(FailingService)
            const scope = collection.build().createScope()
            expect(() => scope.resolve(FailingService)).toThrow()
            expect(scope.resolve(DepA).isDisposed()).toBe(false)
        })

        it("should allow resolving fresh instances after a failed attempt", (): void => {
            @Injectable() class DepA extends TestDisposable {}
            @Injectable() class FailingService { constructor(public a: DepA) { throw new Error("failed") } }
            collection.addScoped(DepA).addScoped(FailingService)
            const scope = collection.build().createScope()
            expect(() => scope.resolve(FailingService)).toThrow()
            expect(scope.resolve(DepA)).toBeInstanceOf(DepA)
        })

        it("should not dispose already committed instances on subsequent failures", (): void => {
            @Injectable() class DepA extends TestDisposable {}
            @Injectable() class FailingService { constructor(public a: DepA) { throw new Error("failed") } }
            collection.addScoped(DepA)
            collection.addScoped(FailingService)
            const scope = collection.build().createScope()
            const committed = scope.resolve(DepA)
            expect(() => scope.resolve(FailingService)).toThrow()
            expect(committed.isDisposed()).toBe(false)
        })
    })

    describe("dispose", (): void => {
        
        it("should dispose scoped instances that implement IDisposable", (): void => {
            @Injectable() class MyService extends TestDisposable {}
            collection.addScoped(MyService)
            const scope = collection.build().createScope()
            const instance = scope.resolve(MyService)
            scope.isDisposed()
            scope.dispose()
            expect(instance.isDisposed()).toBe(true)
        })

        it("should throw ProviderDisposedError after disposal", (): void => {
            @Injectable() class MyService {}
            collection.addScoped(MyService)
            const scope = collection.build().createScope()
            scope.dispose()
            expect(() => scope.resolve(MyService)).toThrow(ProviderDisposedError)
        })

        it("should not throw when dispose is called multiple times", (): void => {
            const scope = collection.build().createScope()
            scope.dispose()
            expect(() => scope.dispose()).not.toThrow()
        })

        it("should not affect the parent ServiceProvider when disposed", (): void => {
            @Injectable() class MyService {}
            collection.addSingleton(MyService)
            const provider = collection.build()
            const scope = provider.createScope()
            scope.dispose()
            expect(() => provider.resolve(MyService)).not.toThrow()
        })
    })
})