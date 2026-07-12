type LogContext = Record<string, unknown>;

export const logger = {
  error(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(message, context);
    }
  },
  warn(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(message, context);
    }
  },
};
