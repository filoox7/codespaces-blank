const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const page = fs.readFileSync(path.join(__dirname, 'public', 'index.html'))

function createStatusServer(getStatus, options = {}) {
  const server = http.createServer((request, response) => {
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' })
      return response.end()
    }

    if (request.url === '/health') {
      const status = getStatus()
      response.writeHead(status.online ? 200 : 503, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      })
      return response.end(JSON.stringify(status))
    }

    if (request.url !== '/') {
      response.writeHead(404)
      return response.end('Not found')
    }

    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    response.end(page)
  })

  const port = Number(options.port || process.env.PORT || 3000)
  const host = options.host || process.env.HOST || '0.0.0.0'
  return { server, port, host }
}

module.exports = { createStatusServer }