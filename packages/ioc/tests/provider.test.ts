import { beforeEach, describe, expect, it } from "bun:test"
import {
    CannotResolveServiceProviderError,
    CaptiveDependencyError, CircularDependencyError, Inject, NoMetadataFoundError,
    RequiredScopedServiceProviderError, ScopedServiceProvider,
    ServiceCollection, ServiceDisposedError,
    ServiceNotRegisteredError, ServiceProvider
} from "../src"

class TestDisposable {
    private disposed = false

    dispose(): void {
        this.disposed = true
    }

    isDisposed(): boolean {
        return this.disposed
    }
}

describe("ServiceProvider", (): void => {
    let services: ServiceCollection

    beforeEach((): void => {
        services = new ServiceCollection()
    })

    describe("singleton lifetime", (): void => {

        it("should resolve a singleton by constructor", (): void => {
            class MyService {
            }

            services.addSingleton(MyService)
            const provider = services.build()

            expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
        })

        it("should return the same instance on multiple resolves", (): void => {
            class MyService {
            }

            services.addSingleton(MyService)
            const provider = services.build()

            expect(provider.resolve(MyService)).toBe(provider.resolve(MyService))
        })

        it("should resolve a pre-registered instance directly", (): void => {
            class MyService {
            }

            const instance = new MyService()
            services.addSingletonInstance(MyService, instance)
            const provider = services.build()

            expect(provider.resolve(MyService)).toBe(instance)
        })

        it("should resolve a singleton via factory", (): void => {
            class MyService {
            }

            services.addSingletonFactory(MyService, () => new MyService())
            const provider = services.build()

            expect(provider.resolve(MyService)).toBe(provider.resolve(MyService))
        })

        it("should throw captive dependency error when singleton depends on scoped service", (): void => {
            class ScopedDep {
            }

            class MySingleton {
                constructor(public dep: ScopedDep) {
                }
            }

            services.addScoped(ScopedDep)
            services.addSingleton(MySingleton)
            const provider = services.build()

            expect(() => provider.resolve(MySingleton)).toThrow(CaptiveDependencyError)
        })
    })

    describe("transient lifetime", (): void => {

        it("should resolve a transient service", (): void => {
            class MyService {
            }

            services.addTransient(MyService)
            const provider = services.build()

            expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
        })

        it("should resolve a transient via factory", (): void => {
            class MyService {
            }

            services.addTransientFactory(MyService, () => new MyService())
            const provider = services.build()

            expect(provider.resolve(MyService)).toBeInstanceOf(MyService)
        })

        it("should return a new instance on every resolve", (): void => {
            class ServiceA {
            }

            class ServiceB {
            }

            services.addTransient(ServiceA)
            services.addTransientFactory(ServiceB, () => new ServiceB())
            const provider = services.build()

            expect(provider.resolve(ServiceA)).not.toBe(provider.resolve(ServiceA))
            expect(provider.resolve(ServiceB)).not.toBe(provider.resolve(ServiceB))
        })
    })

    describe("scoped lifetime", (): void => {

        it("should throw when resolving scoped service without a scope", (): void => {
            class MyService {
            }

            services.addScoped(MyService)
            const provider = services.build()

            expect(() => provider.resolve(MyService)).toThrow(RequiredScopedServiceProviderError)
        })
    })

    describe("resolution", (): void => {

        it("should throw ServiceNotRegisteredError for unknown identifier", (): void => {
            class MyService {
            }

            const provider = services.build()

            expect(() => provider.resolve(MyService)).toThrow(ServiceNotRegisteredError)
        })

        it("should throw CannotResolveServiceProviderError for ServiceProvider", (): void => {
            const provider = services.build()

            expect(() => provider.resolve(ServiceProvider)).toThrow(CannotResolveServiceProviderError)
        })

        it("should throw CannotResolveServiceProviderError for ScopedServiceProvider", (): void => {
            const provider = services.build()

            expect(() => provider.resolve(ScopedServiceProvider)).toThrow(CannotResolveServiceProviderError)
        })

        it("should throw CircularDependencyError on direct circular dependency", (): void => {
            class ServiceA {
                constructor(public a: ServiceA) {
                }
            }

            services.addSingleton(ServiceA)
            const provider = services.build()

            expect(() => provider.resolve(ServiceA)).toThrow(CircularDependencyError)
        })

        it("should throw CircularDependencyError on indirect circular dependency", (): void => {
            class ServiceA {
                constructor(public b: ServiceB) {
                }
            }

            class ServiceB {
                constructor(public a: ServiceA) {
                }
            }

            services.addSingleton(ServiceA)
            services.addSingleton(ServiceB)
            const provider = services.build()

            expect(() => provider.resolve(ServiceA)).toThrow(CircularDependencyError)
        })

        it.failing("should throw NoMetadataFoundError when constructor has params but no metadata", (): void => {
            class Dep {
            }

            class MyService {
                constructor(public dep: Dep, public value: string) {
                }
            }

            services.addSingleton(Dep)
            services.addSingleton(MyService)
            const provider = services.build()

            expect(() => provider.resolve(MyService)).toThrow(NoMetadataFoundError)
        })

        it("should resolve using $inject when metadata is unavailable", (): void => {
            class Dep {
            }

            class MyService {
                public static $inject = [Dep]

                constructor(public dep: Dep) {
                }
            }

            services.addSingleton(Dep)
            services.addSingleton(MyService)
            const provider = services.build()

            const resolved = provider.resolve(MyService)
            expect(resolved).toBeInstanceOf(MyService)
            expect(resolved.dep).toBeInstanceOf(Dep)
        })

        it("should resolve a chain of dependencies correctly", (): void => {
            class DepA {
            }

            class DepB {
                constructor(public a: DepA) {
                }
            }

            class DepC {
                constructor(public a: DepA, public b: DepB) {
                }
            }

            services.addSingleton(DepA)
            services.addSingleton(DepB)
            services.addSingleton(DepC)
            const provider = services.build()

            const c = provider.resolve(DepC)
            expect(c).toBeInstanceOf(DepC)
            expect(c.b).toBeInstanceOf(DepB)
            expect(c.a).toBeInstanceOf(DepA)
        })

        it("should cache parameter types after first resolution", (): void => {
            class Dep {
            }

            class MyService {
                public static $inject = [Dep]

                constructor(public dep: Dep) {
                }
            }

            services.addTransient(Dep)
            services.addTransient(MyService)
            const provider = services.build()

            provider.resolve(MyService)
            expect(() => provider.resolve(MyService)).not.toThrow()
        })
    })

    describe("dispose", (): void => {

        it("should dispose all singleton instances that implement IDisposable", (): void => {
            class MyService extends TestDisposable {
            }

            services.addSingleton(MyService)
            const provider = services.build()
            const instance = provider.resolve(MyService)

            provider.dispose()

            expect(instance.isDisposed()).toBe(true)
        })

        it("should not dispose singleton instances that do not implement IDisposable", (): void => {
            class MyService {
            }

            services.addSingleton(MyService)
            const provider = services.build()
            provider.resolve(MyService)

            expect(() => provider.dispose()).not.toThrow()
        })

        it("should throw ServiceDisposedError after disposal", (): void => {
            class MyService {
            }

            services.addSingleton(MyService)
            const provider = services.build()
            provider.dispose()

            expect(() => provider.resolve(MyService)).toThrow(ServiceDisposedError)
        })

        it("should not throw when dispose is called multiple times", (): void => {
            const provider = services.build()
            provider.dispose()

            expect(() => provider.dispose()).not.toThrow()
        })
    })
})

describe("ScopedServiceProvider", (): void => {
    let services: ServiceCollection

    beforeEach((): void => {
        services = new ServiceCollection()
    })

    describe("scoped", (): void => {

        it("should resolve a scoped service within a scope", (): void => {
            class MyService {
            }

            services.addScoped(MyService)
            const scope = services.build().createScope()

            expect(scope.resolve(MyService)).toBeInstanceOf(MyService)
        })

        it("should return the same instance within the same scope", (): void => {
            class MyService {
            }

            services.addScoped(MyService)
            const scope = services.build().createScope()

            expect(scope.resolve(MyService)).toBe(scope.resolve(MyService))
        })

        it("should return different instances across different scopes", (): void => {
            class MyService {
            }

            services.addScoped(MyService)
            const provider = services.build()
            const scope1 = provider.createScope()
            const scope2 = provider.createScope()

            expect(scope1.resolve(MyService)).not.toBe(scope2.resolve(MyService))
        })

        it("should resolve scoped service that depends on another scoped service", (): void => {
            class DepA {
            }

            class DepB {
                constructor(public a: DepA) {
                }
            }

            services.addScoped(DepA)
            services.addScoped(DepB)
            const scope = services.build().createScope()

            const b = scope.resolve(DepB)
            expect(b).toBeInstanceOf(DepB)
            expect(b.a).toBeInstanceOf(DepA)
        })
    })

    describe("partial failure isolation", (): void => {

        it("should dispose partial dependencies when implementation throws", (): void => {
            class DepA extends TestDisposable {}
            class FailingService {
                constructor(public a: DepA) { throw new Error("Construction failed") }
            }

            services.addScoped(DepA)
            services.addScoped(FailingService)
            const scope = services.build().createScope()

            expect(() => scope.resolve(FailingService)).toThrow("Construction failed")
        })

        it("should not leak failed dependencies into the scope", (): void => {
            class DepA extends TestDisposable {}
            class FailingService {
                constructor(public a: DepA) { throw new Error("Construction failed") }
            }
            
            services.addScoped(DepA)
            services.addScoped(FailingService)
            const scope = services.build().createScope()

            expect(() => scope.resolve(FailingService)).toThrow()

            const freshA = scope.resolve(DepA)
            expect(freshA.isDisposed()).toBe(false)
        })
        
        it("should allow resolving fresh instances after a failed attempt", (): void => {
            class DepA extends TestDisposable {}
            class FailingService {
                constructor(public a: DepA) { throw new Error("Construction failed") }
            }
            
            services.addScoped(DepA)
            services.addScoped(FailingService)
            const scope = services.build().createScope()

            expect(() => scope.resolve(FailingService)).toThrow()

            expect(scope.resolve(DepA)).toBeInstanceOf(DepA)
        })
        
        it("should not dispose already-committed instances on subsequent failures", (): void => {
            class DepA extends TestDisposable {}
            class FailingService {
                constructor(public a: DepA) { throw new Error("Construction failed") }
            }
            
            services.addScoped(DepA)
            services.addScoped(FailingService)
            const scope = services.build().createScope()

            const committedA = scope.resolve(DepA)
            expect(() => scope.resolve(FailingService)).toThrow()

            expect(committedA.isDisposed()).toBe(false)
        })
    })

    describe("dispose", (): void => {

        it("should dispose all scoped instances that implement IDisposable", (): void => {
            class MyService extends TestDisposable {}
            services.addScoped(MyService)
            
            const scope = services.build().createScope()
            const instance = scope.resolve(MyService)

            scope.dispose()

            expect(instance.isDisposed()).toBe(true)
        })
        
        it("should not dispose scoped instances that do not implement IDisposable", (): void => {
            class MyService {}
            
            services.addScoped(MyService)
            const scope = services.build().createScope()
            scope.resolve(MyService)

            expect(() => scope.dispose()).not.toThrow()
        })
        
        it("should throw ServiceDisposedError after disposal", (): void => {
            class MyService {}
            
            services.addScoped(MyService)
            const scope = services.build().createScope()
            scope.dispose()

            expect(() => scope.resolve(MyService)).toThrow(ServiceDisposedError)
        })
        
        it("should not throw when dispose is called multiple times", (): void => {
            const scope = services.build().createScope()
            scope.dispose()

            expect(() => scope.dispose()).not.toThrow()
        })
        
        it("should not affect the parent ServiceProvider when disposed", (): void => {
            class MyService {}
            
            services.addSingleton(MyService)
            const provider = services.build()
            const scope = provider.createScope()
            scope.dispose()

            expect(() => provider.resolve(MyService)).not.toThrow()
        })
    })
})

describe("@Inject decorator", (): void => {
    let services: ServiceCollection

    beforeEach((): void => {
        services = new ServiceCollection()
    })

    describe("parameter decoration", (): void => {
        
        it("should store the token on $injectOverrides at the correct index", (): void => {
            class MyService {
                public constructor(
                    _a: string,
                    @Inject("token") _b: string
                ) {}
            }

            expect((MyService as any).$injectOverrides[1]).toBe("token")
        })

        it("should not affect undecorated parameter indices", (): void => {
            class MyService {
                public constructor(
                    _a: string,
                    @Inject("token") _b: string
                ) {}
            }

            expect((MyService as any).$injectOverrides[0]).toBeUndefined()
        })

        it("should support multiple @Inject decorators on the same constructor", (): void => {
            class MyService {
                public constructor(
                    @Inject("tokenA") _a: string,
                    @Inject("tokenB") _b: string
                ) {}
            }

            expect((MyService as any).$injectOverrides[0]).toBe("tokenA")
            expect((MyService as any).$injectOverrides[1]).toBe("tokenB")
        })

        it("should support symbol tokens", (): void => {
            const token = Symbol("myToken")

            class MyService {
                public constructor(
                    @Inject(token) _a: string
                ) {}
            }

            expect((MyService as any).$injectOverrides[0]).toBe(token)
        })

        it("should support constructor tokens", (): void => {
            class Dep {}

            class MyService {
                public constructor(
                    @Inject(Dep) _a: Dep
                ) {}
            }

            expect((MyService as any).$injectOverrides[0]).toBe(Dep)
        })
    })

    describe("resolution", (): void => {
        
        it("should resolve a string token injected via @Inject", (): void => {
            class MyService {
                public static $inject = ["secret"]
                public constructor(public readonly secret: string) {}
            }

            services.addSingletonInstance("secret", "my-secret-value")
            services.addSingleton(MyService)
            const provider = services.build()

            const instance = provider.resolve(MyService)
            expect(instance.secret).toBe("my-secret-value")
        })

        it("should resolve a symbol token injected via @Inject", (): void => {
            const SecretToken = Symbol("secret")

            class MyService {
                public static $inject = [SecretToken]
                public constructor(public readonly secret: string) {}
            }

            services.addSingletonInstance(SecretToken, "symbol-secret")
            services.addSingleton(MyService)
            const provider = services.build()

            const instance = provider.resolve(MyService)
            expect(instance.secret).toBe("symbol-secret")
        })

        it("should mix @Inject overrides with class-typed parameters", (): void => {
            class Dep {}

            class MyService {
                public static $inject = [Dep, "secret"]
                public constructor(
                    public readonly dep: Dep,
                    public readonly secret: string
                ) {}
            }

            services.addSingleton(Dep)
            services.addSingletonInstance("secret", "mixed-secret")
            services.addSingleton(MyService)
            const provider = services.build()

            const instance = provider.resolve(MyService)
            expect(instance.dep).toBeInstanceOf(Dep)
            expect(instance.secret).toBe("mixed-secret")
        })

        it("should throw when the injected token is not registered", (): void => {
            class MyService {
                public static $inject = ["unregistered"]
                public constructor(public readonly value: string) {}
            }

            services.addSingleton(MyService)
            const provider = services.build()

            expect(() => provider.resolve(MyService)).toThrow(ServiceNotRegisteredError)
        })

        it("should resolve different values for different tokens", (): void => {
            class MyService {
                public static $inject = ["host", "port"]
                public constructor(
                    public readonly host: string,
                    public readonly port: number
                ) {}
            }

            services.addSingletonInstance("host", "localhost")
            services.addSingletonInstance("port", 5432)
            services.addSingleton(MyService)
            const provider = services.build()

            const instance = provider.resolve(MyService)
            expect(instance.host).toBe("localhost")
            expect(instance.port).toBe(5432)
        })
    })

    describe("$injectOverrides applied during resolution", (): void => {
        
        it("should use @Inject override instead of reflected type", (): void => {
            const SecretToken = Symbol("secret")

            class MyService {
                public constructor(
                    @Inject(SecretToken) public readonly secret: string
                ) {}
            }

            services.addSingletonInstance(SecretToken, "overridden-value")
            services.addSingleton(MyService)
            const provider = services.build()

            const instance = provider.resolve(MyService)
            expect(instance.secret).toBe("overridden-value")
        })

        it("should only override decorated indices, leaving others to reflection", (): void => {
            class Dep {}
            const SecretToken = Symbol("secret")

            class MyService {
                public constructor(
                    public readonly dep: Dep,
                    @Inject(SecretToken) public readonly secret: string
                ) {}
            }

            services.addSingleton(Dep)
            services.addSingletonInstance(SecretToken, "partial-override")
            services.addSingleton(MyService)
            const provider = services.build()

            const instance = provider.resolve(MyService)
            expect(instance.dep).toBeInstanceOf(Dep)
            expect(instance.secret).toBe("partial-override")
        })
    })
})