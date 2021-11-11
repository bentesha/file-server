const { config } = require('dotenv')

config() // Load .env file

module.exports = {
  port: process.env.PORT || 8000,
  uploadDir: process.env.UPLOAD_DIR || __dirname + '/files',
  resizedImagesDir: process.env.RESIZED_IMAGE_DIR || __dirname + '/files/resized',
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost'
  }
}
