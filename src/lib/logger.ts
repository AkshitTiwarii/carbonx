/**
 * Centralized logging utility
 * Can be extended to integrate with Sentry, Logtail, or other logging services
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error?.message || error,
        stack: error?.stack,
      };
      console.error(this.formatMessage('error', message, errorContext));
      
      // Send to external logging service if available
      this.sendToExternalService('error', message, errorContext);
    }
  }

  private sendToExternalService(level: LogLevel, message: string, context: LogContext) {
    // Integrate with external logging service
    // Example: Sentry, Logtail, etc.
    
    if (typeof window !== 'undefined' && (window as any).logError) {
      try {
        (window as any).logError(level, {
          message,
          ...context,
        });
      } catch (e) {
        // Silently fail if external logging fails
      }
    }

    // Example Sentry integration:
    /*
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(message), {
        level,
        extra: context,
      });
    }
    */
  }
}

export const logger = new Logger();

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      type: 'unhandled_rejection',
    });
  });

  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', event.error || event.message, {
      type: 'unhandled_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

