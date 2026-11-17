import { createScopedLogger, logger } from "./logger"

describe("logger", () => {
  let logSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("logs the message with its level", () => {
    logger.info("hello")
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toContain("[INFO] hello")
  })

  it("redacts sensitive keys from the context", () => {
    logger.info("login attempt", {
      userId: "u1",
      password: "hunter2",
      token: "abc",
      email: "a@b.com",
    })
    const output = logSpy.mock.calls[0][0] as string
    expect(output).toContain('"userId":"u1"')
    expect(output).toContain('"password":"[REDACTED]"')
    expect(output).toContain('"token":"[REDACTED]"')
    expect(output).toContain('"email":"[REDACTED]"')
    expect(output).not.toContain("hunter2")
  })

  it("redacts sensitive keys in nested objects", () => {
    logger.warn("nested", { meta: { apiKey: "secret-key", ok: true } })
    const output = warnSpy.mock.calls[0][0] as string
    expect(output).toContain('"apiKey":"[REDACTED]"')
    expect(output).toContain('"ok":true')
    expect(output).not.toContain("secret-key")
  })

  it("logs errors through console.error", () => {
    logger.error("boom")
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0][0]).toContain("[ERROR] boom")
  })

  it("scoped loggers prefix the scope", () => {
    const scoped = createScopedLogger("fetch-news")
    scoped.info("done")
    expect(logSpy.mock.calls[0][0]).toContain("[fetch-news] done")
  })
})
