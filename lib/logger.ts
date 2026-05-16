/**
 * Structured logging utility for the application.
 * Provides consistent logging with different levels and context.
 *
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Structured context data
 * - Error tracking integration ready (Sentry, LogRocket, etc.)
 * - Production vs development behavior
 * - Request tracking
 * - Performance monitoring
 *
 * In production, you can integrate with services like:
 * - Sentry for error tracking
 * - DataDog for APM
 * - LogRocket for session replay
 * - CloudWatch for AWS deployments
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  /** User ID if available */
  userId?: string;

  /** Request ID for tracking */
  requestId?: string;

  /** API endpoint being called */
  endpoint?: string;

  /** HTTP method */
  method?: string;

  /** Duration in milliseconds */
  duration?: number;

  /** Additional custom data */
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Environment-aware logger that adjusts behavior based on NODE_ENV.
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log an error. Always logged in all environments.
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('error', message, context, error);

    // Console output
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      console.error(JSON.stringify(entry));
    }

    // Send to error tracking service in production
    if (this.isProduction) {
      this.sendToErrorTracking(entry);
    }
  }

  /**
   * Log a warning. Logged in development and production.
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      console.warn(JSON.stringify(entry));
    }
  }

  /**
   * Log informational message. Logged in development only by default.
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);

    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context);
    } else if (process.env.VERBOSE_LOGGING === 'true') {
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Log debug message. Only in development.
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry('debug', message, context);
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log API request with timing information.
   */
  request(
    method: string,
    endpoint: string,
    context: Omit<LogContext, 'method' | 'endpoint'>
  ): void {
    this.info(`${method} ${endpoint}`, {
      ...context,
      method,
      endpoint,
    });
  }

  /**
   * Log slow API request (performance warning).
   */
  slowRequest(
    method: string,
    endpoint: string,
    duration: number,
    context?: Omit<LogContext, 'method' | 'endpoint' | 'duration'>
  ): void {
    this.warn(`Slow request: ${method} ${endpoint} took ${duration}ms`, {
      ...context,
      method,
      endpoint,
      duration,
    });
  }

  /**
   * Create a structured log entry.
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Send log entry to error tracking service (Sentry, etc.).
   * Override this method to integrate with your preferred service.
   */
  private sendToErrorTracking(entry: LogEntry): void {
    // Example: Sentry integration
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(new Error(entry.message), {
    //     level: entry.level,
    //     contexts: { log: entry.context },
    //   });
    // }

    // For now, just ensure it's logged
    // You can add your error tracking service here
  }

  /**
   * Create a child logger with preset context.
   * Useful for adding consistent context across multiple logs.
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalError = this.error.bind(this);
    const originalWarn = this.warn.bind(this);
    const originalInfo = this.info.bind(this);
    const originalDebug = this.debug.bind(this);

    // Override methods to include context
    childLogger.error = (message: string, error?: Error, ctx?: LogContext) => {
      originalError(message, error, { ...context, ...ctx });
    };

    childLogger.warn = (message: string, ctx?: LogContext) => {
      originalWarn(message, { ...context, ...ctx });
    };

    childLogger.info = (message: string, ctx?: LogContext) => {
      originalInfo(message, { ...context, ...ctx });
    };

    childLogger.debug = (message: string, ctx?: LogContext) => {
      originalDebug(message, { ...context, ...ctx });
    };

    return childLogger;
  }
}

/**
 * Global logger instance.
 */
export const logger = new Logger();

/**
 * Helper to measure and log execution time.
 *
 * @example
 * const timer = measureTime();
 * await doSomething();
 * timer.end('Operation completed');
 */
export function measureTime(context?: LogContext) {
  const startTime = Date.now();

  return {
    /**
     * End timing and log the duration.
     */
    end: (message: string, additionalContext?: LogContext) => {
      const duration = Date.now() - startTime;
      const fullContext = { ...context, ...additionalContext, duration };

      if (duration > 1000) {
        logger.slowRequest(
          fullContext.method || 'UNKNOWN',
          fullContext.endpoint || 'unknown-endpoint',
          duration,
          fullContext
        );
      } else {
        logger.info(message, fullContext);
      }

      return duration;
    },

    /**
     * Get current duration without ending.
     */
    getDuration: () => Date.now() - startTime,
  };
}

/**
 * Wrapper for API route handlers with automatic logging.
 *
 * @example
 * export const GET = withLogging(async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ data: 'hello' });
 * }, { endpoint: '/api/books' });
 */
export function withLogging<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options: {
    endpoint: string;
    logSuccess?: boolean;
    logErrors?: boolean;
  } = { endpoint: 'unknown', logSuccess: true, logErrors: true }
): T {
  return (async (...args: any[]) => {
    const timer = measureTime({ endpoint: options.endpoint });
    const request = args[0] as Request;
    const method = request?.method || 'UNKNOWN';

    try {
      const result = await handler(...args);
      const duration = timer.getDuration();

      if (options.logSuccess) {
        logger.request(method, options.endpoint, { duration });
      }

      return result;
    } catch (error) {
      const duration = timer.getDuration();

      if (options.logErrors) {
        logger.error(
          `Error in ${method} ${options.endpoint}`,
          error as Error,
          { duration }
        );
      }

      throw error;
    }
  }) as T;
}

/**
 * Log user action for analytics/auditing.
 */
export function logUserAction(
  action: string,
  userId: string,
  metadata?: Record<string, any>
): void {
  logger.info(`User action: ${action}`, {
    userId,
    action,
    ...metadata,
  });
}

/**
 * Log database query performance.
 */
export function logDatabaseQuery(
  query: string,
  duration: number,
  context?: LogContext
): void {
  if (duration > 100) {
    logger.warn(`Slow database query: ${query}`, {
      ...context,
      query,
      duration,
      type: 'database',
    });
  } else if (process.env.LOG_DB_QUERIES === 'true') {
    logger.debug(`Database query: ${query}`, {
      ...context,
      query,
      duration,
      type: 'database',
    });
  }
}

/**
 * Log external API call.
 */
export function logExternalAPI(
  service: string,
  endpoint: string,
  duration: number,
  success: boolean,
  context?: LogContext
): void {
  const message = `External API call to ${service}: ${endpoint}`;

  if (!success) {
    logger.error(message, undefined, {
      ...context,
      service,
      endpoint,
      duration,
      success: false,
    });
  } else if (duration > 2000) {
    logger.warn(`Slow ${message}`, {
      ...context,
      service,
      endpoint,
      duration,
      success: true,
    });
  } else {
    logger.debug(message, {
      ...context,
      service,
      endpoint,
      duration,
      success: true,
    });
  }
}

/**
 * Create a request-scoped logger with request ID.
 */
export function createRequestLogger(request: Request): Logger {
  const requestId = generateRequestId();

  return logger.child({
    requestId,
    method: request.method,
    url: request.url,
  });
}

/**
 * Generate a unique request ID for tracking.
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log book import statistics.
 */
export function logImportStats(stats: {
  source: string;
  totalRows: number;
  successCount: number;
  skipCount: number;
  errorCount: number;
  duration: number;
}): void {
  logger.info('Import completed', {
    type: 'import',
    ...stats,
  });
}

/**
 * Default export for convenience.
 */
export default logger;
