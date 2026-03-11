import { ReflectionClass } from "@deepkit/type"
import type { Constructor } from "./types"
import * as console from "node:console"

class ServiceA {

    constructor() {
    }
    
    methodA(): void {}
}

class ServiceB {

    constructor(public readonly a?: ServiceA) {}

    methodC(): void {}
}

class ServiceC {

    constructor(public readonly a?: ServiceA) {}

    methodC(): void {}
}

class Logger {
    
    public log(message: string): void {}
}

// function displayLoggerMethods<T>(implementation: Constructor<T>) {
//     const reflection = ReflectionClass.from<T>(implementation)
//     console.log(`${reflection.getClassName()}: ${reflection.getMethodNames()}`)
// }
//
// displayLoggerMethods(ServiceA)
// displayLoggerMethods(ServiceB)
// displayLoggerMethods(ServiceC)

function test<T>(implementation: Constructor<T>): void {
    const reflection = ReflectionClass.from<T>(implementation)
    
    const params = reflection.getPropertiesDeclaredInConstructor()
    params.forEach(param => console.log(param.getResolvedReflectionClass().getClassType()))
}

test(Logger)
