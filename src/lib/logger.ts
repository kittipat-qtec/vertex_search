type Severity = "INFO" | "WARNING" | "ERROR";

interface LogEntry {
  severity: Severity;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

const emit = (entry: LogEntry) => {
  // Cloud Logging parses structured JSON from stdout/stderr automatically
  const output = JSON.stringify(entry);

  if (entry.severity === "ERROR") {
    console.error(output);
  } else if (entry.severity === "WARNING") {
    console.warn(output);
  } else {
    console.log(output);
  }
};

const createEntry = (
  severity: Severity,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry => ({
  severity,
  message,
  timestamp: new Date().toISOString(),
  ...meta,
});

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    emit(createEntry("INFO", message, meta));
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    emit(createEntry("WARNING", message, meta));
  },

  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const errorDetails: Record<string, unknown> = { ...meta };

    if (error instanceof Error) {
      errorDetails.errorName = error.name;
      errorDetails.errorMessage = error.message;
      errorDetails.stack = error.stack;
    } else if (error != null) {
      errorDetails.errorRaw = String(error);
    }

    emit(createEntry("ERROR", message, errorDetails));
  },
};
