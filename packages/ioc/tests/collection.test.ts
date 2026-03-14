import { beforeEach, describe, expect, it } from "bun:test"
import {
    NoImplementationProvidedError,
    ServiceAlreadyRegisteredError,
    ServiceCollection,
    ServiceNotRegisteredError
} from "../src"

describe("ServiceCollection", (): void => {
    let services: ServiceCollection

    beforeEach((): void => {
        services = new ServiceCollection()
    })

    it("should register a class by constructor", (): void => {
        class MyService {
        }

        services.addSingleton(MyService)
        const provider = services.build()

        expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
    })

    it("should register a class with a separate implementation", (): void => {
        abstract class IMyService {
        }

        class MyServiceImpl extends IMyService {
        }

        services.addSingleton(IMyService, MyServiceImpl)
        const provider = services.build()

        expect(provider.resolve(IMyService)).toBeInstanceOf(MyServiceImpl)
    })

    it("should register a factory", (): void => {
        class MyService {
        }

        services.addSingletonFactory(MyService, () => new MyService())
        const provider = services.build()

        expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
    })

    it("should register an instance as singleton", (): void => {
        class MyService {
        }

        const instance = new MyService()

        services.addSingletonInstance(MyService, instance)
        const provider = services.build()

        expect(provider.resolve(MyService)).toBe(instance)
    })

    it("should throw when registering a non-constructor identifier without an implementation", (): void => {
        const serviceName = "MyService"

        expect(() => services.addSingleton(serviceName)).toThrow(NoImplementationProvidedError)
        expect(() => services.addSingleton(Symbol(serviceName))).toThrow(NoImplementationProvidedError)
    })

    it("should throw when registering the same identifier twice", (): void => {
        class MyService {
        }

        services.addSingleton(MyService)

        expect(() => services.addSingleton(MyService)).toThrow(ServiceAlreadyRegisteredError)
    })

    it("should not affect built provider when collection is modified after build", (): void => {
        class ServiceA {
        }

        class ServiceB {
        }

        services.addSingleton(ServiceA)
        const provider = services.build()
        services.addSingleton(ServiceB)

        expect(provider.resolve(ServiceA)).toBeInstanceOf(ServiceA)
        expect(() => provider.resolve(ServiceB)).toThrow(ServiceNotRegisteredError)
    })
})