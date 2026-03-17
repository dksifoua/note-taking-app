import packageJson from "../../package.json"
import { Injectable } from "@shared/ioc"

@Injectable()
export class RootHandler {

    public async home(): Promise<Response> {
        return Response.json({ message: "Hello from Note Taking API!" })
    }

    public async version(): Promise<Response> {
        const { name, description, version, author, license } = packageJson
        return Response.json({ name, description, version, author, license })
    }
}