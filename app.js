const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const config = require('./config')

const app = express()
app.use(morgan('tiny'))
app.use(cors())

// Load controllers as routes
glob
  .sync('./controllers/*.js')
  .map((controller) => ({
    path: '/' + path.basename(controller, '.js'),
    middleware: require(controller),
  }))
  .forEach((route) => app.use(route.path, route.middleware))

// Create all asset directories
const folders = [config.uploadDir, config.resizedImagesDir]
folders.forEach((path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
})

// Default app error handler
app.use(require('./middleware/error'))

module.exports = app
