type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel =
    (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "debug";

class Logger {
    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
    }

    debug(message: string, ...args: any[]) {
        if (this.shouldLog("debug")) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    info(message: string, ...args: any[]) {
        if (this.shouldLog("info")) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        if (this.shouldLog("warn")) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    error(message: string, ...args: any[]) {
        if (this.shouldLog("error")) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }
}

export const logger = new Logger();
