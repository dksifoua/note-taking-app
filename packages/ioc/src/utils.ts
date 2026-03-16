import type { ClassType, ServiceIdentifier } from "./types"

export function isClass(value: any): value is ClassType {
    if (typeof value === "function") {
        return /^class\s/.test(Function.prototype.toString.call(value))
    }
    
    return false
}

export function toString(identifier: ServiceIdentifier): string {
    return typeof identifier === "function" 
        ? identifier.name 
        : String(identifier)
}