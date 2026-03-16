import { beforeEach, describe, expect, it } from "bun:test"
import {
    Injectable, type IServiceProvider,
    ServiceCollection,
    ServiceIdentifierAlreadyRegisteredError,
    ServiceIdentifierNotRegisteredError,
    ServiceImplementationNotProvidedError,
    ServiceProvider
} from "../src"

describe("ServiceCollection", (): void => {
    let collection: ServiceCollection

    beforeEach((): void => {
        collection = new ServiceCollection()
    })

    describe("addValue", (): void => {
        
        it("should register a value", (): void => {
            collection.addValue<number>("port", 3000)
            const provider = collection.build()
            expect(provider.resolve<number>("port")).toBe(3000)
        })

        it("should throw when registering the same identifier twice", (): void => {
            collection.addValue("port", 3000)
            expect(() => collection.addValue("port", 4000))
                .toThrow(ServiceIdentifierAlreadyRegisteredError)
        })
    })

    describe("addSingleton", (): void => {
        
        it("should register a class by constructor", (): void => {
            @Injectable() class MyService {}
            collection.addSingleton(MyService)
            const provider = collection.build()
            expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
        })

        it("should throw when identifier is not a class and no class is provided", (): void => {
            expect(() => collection.addSingleton("MyService"))
                .toThrow(ServiceImplementationNotProvidedError)
        })
    })

    describe("addSingletonFactory", (): void => {
        
        it("should register a factory", (): void => {
            @Injectable() class MyService {}
            collection.addSingletonFactory(MyService, () => new MyService())
            const provider = collection.build()
            expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
        })
    })

    describe("addScoped", (): void => {
        
        it("should register a scoped class", (): void => {
            @Injectable() class MyService {}
            collection.addScoped(MyService)
            const provider = collection.build()
            const scope = provider.createScope()
            expect(scope.resolve(MyService)).toBeInstanceOf(MyService)
        })

        it("should register a scoped factory", (): void => {
            @Injectable() class MyService {}
            collection.addScopedFactory(MyService, (_: IServiceProvider): MyService => new MyService())
            const provider = collection.build()
            const scope = provider.createScope()
            expect(scope.resolve(MyService)).toBeInstanceOf(MyService)
        })
    })

    describe("addTransient", (): void => {
        
        it("should register a transient class", (): void => {
            @Injectable() class MyService {}
            collection.addTransient(MyService)
            const provider = collection.build()
            expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
        })
    })

    describe("build", (): void => {
        
        it("should return a ServiceProvider", (): void => {
            expect(collection.build()).toBeInstanceOf(ServiceProvider)
        })

        it("should not affect built provider when collection is modified after build", (): void => {
            @Injectable() class ServiceA {}
            @Injectable() class ServiceB {}
            collection.addSingleton(ServiceA)
            const provider = collection.build()
            collection.addSingleton(ServiceB)
            expect(() => provider.resolve(ServiceB)).toThrow(ServiceIdentifierNotRegisteredError)
        })
    })
})