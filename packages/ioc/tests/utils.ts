export class TestDisposable {
    private _disposed = false

    dispose(): void {
        this._disposed = true
    }

    isDisposed(): boolean {
        return this._disposed
    }
}