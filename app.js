const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const glob = require('glob')
const path = require('path')

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

module.exports = app
