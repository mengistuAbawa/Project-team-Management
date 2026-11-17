function write(level, event, details = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details
  };
  const output = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  output(JSON.stringify(record));
}

module.exports = {
  info: (event, details) => write("info", event, details),
  warn: (event, details) => write("warn", event, details),
  error: (event, details) => write("error", event, details)
};
