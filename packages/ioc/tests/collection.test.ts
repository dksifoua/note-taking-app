import { describe, it, expect } from "bun:test"
import { ServiceCollection } from "../src/collection"
import { ServiceProvider } from "../src/provider"

describe("ServiceCollectionTest", () => {
    
    it("should build a ServiceProvider", () => {
        const services = new ServiceCollection()
        const provider = services.build()
        expect(provider).toBeInstanceOf(ServiceProvider)
    })
})