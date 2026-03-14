import packageJson from "../../package.json"

export class RootHandler {

    public async home(): Promise<Response> {
        return Response.json({ message: "Hello from Note Taking API!" })
    }

    public async version(): Promise<Response> {
        const { name, description, version, author, license } = packageJson
        return Response.json({ name, description, version, author, license })
    }
}