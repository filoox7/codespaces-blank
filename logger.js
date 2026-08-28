function write(level, message, details = {}) {
  const suffix = Object.keys(details).length ? ` ${JSON.stringify(details)}` : ''
  console.log(`[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${suffix}`)
}

module.exports = {
  info: (message, details) => write('info', message, details),
  decision: (message, details) => write('decision', message, details),
  error: (message, error) => write('error', message, { error: error?.message || String(error) })
}
