import packageJson from "../package.json"

export class DefaultHandler {
    
    public constructor() {
        this.home = this.home.bind(this)
        this.version = this.version.bind(this)
    }
    
    public async home(): Promise<Response> {
        return new Response(JSON.stringify({ message: "Hello from Note Taking API!" }), { status: 200 })
    }

    public async version(): Promise<Response> {
        const { name, description, version, author, license } = packageJson
        return new Response(JSON.stringify({ name, description, version, author, license }), { status: 200 })
    }
}