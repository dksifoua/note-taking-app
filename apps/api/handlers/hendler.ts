import type { ServiceProvider } from "ioc/src/provider"
import type { ServiceIdentifier } from "ioc/src/types"

export function getHandleRequestFn(provider: ServiceProvider): <THandler, TResult>(
    service: ServiceIdentifier<THandler>,
    handleFn: (resolved: THandler) => Promise<TResult>
) => Promise<TResult> {

    return function handleRequest<THandler, TResult>(
        service: ServiceIdentifier<THandler>,
        handleFn: (resolved: THandler) => Promise<TResult>
    ): Promise<TResult> {
        const scope = provider.createScope()
        try {
            const instance = scope.resolve(service)
            return handleFn(instance)
        } finally {
            scope.dispose()
        }
    }
}