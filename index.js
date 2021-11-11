const app = require('./app')
const config = require('./config')
const glob = require('glob')

async function main() {
  // Start background workers
  glob.sync('./workers/*.js').forEach(require)

  const server = app.listen(config.port, () => {
    console.log('File server listening on port: ' + server.address().port)
  })
}

main().catch(console.log)
