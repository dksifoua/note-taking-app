import { beforeEach, describe, expect, it, spyOn } from "bun:test"
import type { ILogger } from "../src"
import { Logger } from "../src"

describe("Logging", (): void => {
    let logger: ILogger

    beforeEach((): void => {
        logger = new Logger("test", "debug")
    })

    describe("constructor", (): void => {

        it("should default minLevel to info", (): void => {
            const defaultLogger = new Logger("test")
            const debugSpy = spyOn(console, "debug")

            defaultLogger.debug("should not appear")

            expect(debugSpy).not.toHaveBeenCalled()
            debugSpy.mockRestore()
        })

        it("should respect provided minLevel", (): void => {
            const warnLogger = new Logger("test", "warn")
            const infoSpy = spyOn(console, "info")

            warnLogger.info("should not appear")

            expect(infoSpy).not.toHaveBeenCalled()
            infoSpy.mockRestore()
        })
    })

    describe("log levels", (): void => {
        
        it("should call console.debug for debug level", (): void => {
            const spy = spyOn(console, "debug")
            logger.debug("debug message")
            
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        it("should call console.info for info level", (): void => {
            const spy = spyOn(console, "info")
            logger.info("info message")
            
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        it("should call console.warn for warn level", (): void => {
            const spy = spyOn(console, "warn")
            logger.warn("warn message")
            
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        it("should call console.error for error level", (): void => {
            const spy = spyOn(console, "error")
            logger.error("error message")
            
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        it("should call console.error for fatal level", async (): Promise<void> => {
            const consoleSpy = spyOn(console, "error")
            const exitSpy = spyOn(process, "exit").mockImplementation((): never => {
                throw new Error("process.exit called")
            })

            expect(logger.fatal("fatal message")).rejects.toThrow("process.exit called")

            expect(consoleSpy).toHaveBeenCalledTimes(1)
            consoleSpy.mockRestore()
            exitSpy.mockRestore()
        })
    })

    describe("filtering by minLevel", (): void => {
        
        it("should not log messages below minLevel", (): void => {
            const warnLogger = new Logger("test", "warn")
            const debugSpy = spyOn(console, "debug")
            const infoSpy = spyOn(console, "info")

            warnLogger.debug("filtered")
            warnLogger.info("filtered")

            expect(debugSpy).not.toHaveBeenCalled()
            expect(infoSpy).not.toHaveBeenCalled()

            debugSpy.mockRestore()
            infoSpy.mockRestore()
        })

        it("should log messages at exactly minLevel", (): void => {
            const warnLogger = new Logger("test", "warn")
            const spy = spyOn(console, "warn")

            warnLogger.warn("at threshold")

            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        it("should log messages above minLevel", (): void => {
            const warnLogger = new Logger("test", "warn")
            const spy = spyOn(console, "error")

            warnLogger.error("above threshold")

            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        it("should not log anything when minLevel is none", (): void => {
            const noneLogger = new Logger("test", "none")
            const debugSpy = spyOn(console, "debug")
            const infoSpy = spyOn(console, "info")
            const warnSpy = spyOn(console, "warn")
            const errorSpy = spyOn(console, "error")

            noneLogger.debug("filtered")
            noneLogger.info("filtered")
            noneLogger.warn("filtered")
            noneLogger.error("filtered")

            expect(debugSpy).not.toHaveBeenCalled()
            expect(infoSpy).not.toHaveBeenCalled()
            expect(warnSpy).not.toHaveBeenCalled()
            expect(errorSpy).not.toHaveBeenCalled()

            debugSpy.mockRestore()
            infoSpy.mockRestore()
            warnSpy.mockRestore()
            errorSpy.mockRestore()
        })
    })

    describe("message format", (): void => {
        
        it("should include the logger name in the output", (): void => {
            const spy = spyOn(console, "info")
            logger.info("test message")
            const output: string = spy.mock.calls[0]![0] as string
            
            expect(output).toContain("[test]")
            spy.mockRestore()
        })

        it("should include the log level in the output", (): void => {
            const spy = spyOn(console, "info")
            logger.info("test message")
            const output: string = spy.mock.calls[0]![0] as string
            
            expect(output).toContain("INFO")
            spy.mockRestore()
        })

        it("should include the message in the output", (): void => {
            const spy = spyOn(console, "info")
            logger.info("hello world")
            const output: string = spy.mock.calls[0]![0] as string
            
            expect(output).toContain("hello world")
            spy.mockRestore()
        })

        it("should include a timestamp in the output", (): void => {
            const spy = spyOn(console, "info")
            logger.info("test")
            const output: string = spy.mock.calls[0]![0] as string
            
            expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            spy.mockRestore()
        })

        it("should forward extra args to console", (): void => {
            const spy = spyOn(console, "info")
            const extra = { key: "value" }
            logger.info("wit.todoh args", extra)
            
            expect(spy).toHaveBeenCalledWith(expect.any(String), extra)
            spy.mockRestore()
        })
    })

    describe("fatal", (): void => {
        
        it("should call process.exit(1)", async (): Promise<void> => {
            spyOn(console, "error")
            const exitSpy = spyOn(process, "exit").mockImplementation((): never => {
                throw new Error("process.exit called")
            })

            expect(logger.fatal("fatal")).rejects.toThrow()
            expect(exitSpy).toHaveBeenCalledWith(1)

            exitSpy.mockRestore()
        })
    })

    describe("child", (): void => {
        
        it("should return an ILogger instance", (): void => {
            const child = logger.child("ChildService")
            expect(child).toBeDefined()
        })

        it("should include parent and child name in output", (): void => {
            const spy = spyOn(console, "info")
            const child = logger.child("ChildService")
            child.info("from child")
            const output: string = spy.mock.calls[0]![0] as string
            
            expect(output).toContain("test:ChildService")
            spy.mockRestore()
        })

        it("should inherit parent minLevel", (): void => {
            const parent = new Logger("parent", "warn")
            const child = parent.child("child")
            const spy = spyOn(console, "info")

            child.info("should be filtered")

            expect(spy).not.toHaveBeenCalled()
            spy.mockRestore()
        })

        it("should support nested children", (): void => {
            const spy = spyOn(console, "info")
            const child = logger.child("A").child("B")
            child.info("nested")
            const output: string = spy.mock.calls[0]![0] as string
            
            expect(output).toContain("test:A:B")
            spy.mockRestore()
        })
    })
})