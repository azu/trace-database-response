// shared symbol
export const traceSymbol = process.env.NODE_ENV !== "production"
    ? Symbol("TRACE DATA SYMBOL")
    : Symbol();
