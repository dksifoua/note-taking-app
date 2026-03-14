export type LoggingLevel = "debug" | "info" | "warn" | "error" | "fatal" | "none"

export interface ILogger {
    debug(message: string, ...args: any[]): void
    info(message: string, ...args: any[]): void
    warn(message: string, ...args: any[]): void
    error(message: string, ...args: any[]): void
    fatal(message: string, ...args: any[]): Promise<void>
    child(name: string): ILogger
}

const priority: Record<LoggingLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
    none: 5
}

const colors: Record<LoggingLevel, string> = {
    debug: Bun.color("cyan", "ansi")!,
    info: Bun.color("green", "ansi")!,
    warn: Bun.color("yellow", "ansi")!,
    error: Bun.color("rgb(255, 130, 114)", "ansi")!,
    fatal: Bun.color("magenta", "ansi")!,
    none: Bun.color("gray", "ansi")!
}

const reset = "\x1b[0m"

export class Logger implements ILogger {
    private readonly name: string
    private readonly minLevel: LoggingLevel

    public constructor(name: string, minLevel: LoggingLevel = "info") {
        this.name = name
        this.minLevel = minLevel
    }

    public debug(message: string, ...args: any[]): void {
        this.log("debug", message, ...args)
    }

    public info(message: string, ...args: any[]): void {
        this.log("info", message, ...args)
    }

    public warn(message: string, ...args: any[]): void {
        this.log("warn", message, ...args)
    }

    public error(message: string, ...args: any[]): void {
        this.log("error", message, ...args)
    }

    public async fatal(message: string, ...args: any[]): Promise<void> {
        this.log("fatal", message, ...args)
        await new Promise(resolve => setTimeout(resolve, 100))
        process.exit(1)
    }

    public child(name: string): ILogger {
        return new Logger(`${this.name}:${name}`, this.minLevel)
    }

    private log(level: LoggingLevel, message: string, ...args: any[]): void {
        if (priority[level] < priority[this.minLevel]) return

        // TODO
        //  Use Temporal API when available in Bun
        //  Temporal.Now.instant().toString() gives the current moment in UTC and .toString() outputs ISO 8601 format
        //  Equivalent to new Date().toISOString() but using the modern API.
        const timestamp = new Date().toISOString()
        const color = colors[level]
        const upperLevel = level.toUpperCase().padEnd(5)
        const formattedMessage = `[${timestamp}] [${this.name}] [${color}${upperLevel}${reset}] ${message}`

        switch (level) {
            case "debug":
                console.debug(formattedMessage, ...args)
                break
            case "info":
                console.info(formattedMessage, ...args)
                break
            case "warn":
                console.warn(formattedMessage, ...args)
                break
            case "error":
            case "fatal":
                console.error(formattedMessage, ...args)
                break
        }
    }
}