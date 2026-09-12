type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

const sanitize = (context: LogContext): LogContext => {
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "cookie",
    "session",
    "apiKey",
    "api_key",
    "access_token",
    "refresh_token",
    "credit_card",
    "ssn",
    "email",
    "phone",
    "address",
  ]

  const sanitized: LogContext = {}
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = sensitiveKeys.some((k) => lowerKey.includes(k))

    if (isSensitive) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value as LogContext)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

const formatLog = (
  level: LogLevel,
  message: string,
  context: LogContext = {}
): string => {
  const timestamp = new Date().toISOString()
  const sanitizedContext = sanitize(context)
  const contextStr = Object.keys(sanitizedContext).length
    ? ` ${JSON.stringify(sanitizedContext)}`
    : ""
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

const isDevelopment = process.env.NODE_ENV === "development"

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.debug(formatLog("debug", message, context))
    }
  },

  info: (message: string, context?: LogContext) => {
    console.log(formatLog("info", message, context))
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(formatLog("warn", message, context))
  },

  error: (message: string, context?: LogContext) => {
    console.error(formatLog("error", message, context))
  },
}

export const logDebug = logger.debug
export const logInfo = logger.info
export const logWarn = logger.warn
export const logError = logger.error

export function createScopedLogger(scope: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(`[${scope}] ${message}`, context),
    info: (message: string, context?: LogContext) =>
      logger.info(`[${scope}] ${message}`, context),
    warn: (message: string, context?: LogContext) =>
      logger.warn(`[${scope}] ${message}`, context),
    error: (message: string, context?: LogContext) =>
      logger.error(`[${scope}] ${message}`, context),
  }
}