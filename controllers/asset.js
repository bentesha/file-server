const express = require('express')
const config = require('../config')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const { hashObject } = require('../utils/crypto')
const { awaited } = require('../utils/express')
const sharp = require('sharp')
const Joi = require('joi')
const mp3Duration = promisify(require('mp3-duration'))

const controller = {}

controller.image = async (request, response, next) => {
  const file = request.filePath
  // Validate query params
  const schema = Joi.object({
    height: Joi.number().min(16),
    width: Joi.number().min(16),
    fit: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside'),
    position: Joi.string().valid('center', 'top', 'left', 'right', 'bottom')
  })

  // Image resize options are passed as query params
  // Validate query params
  const { value: options, error } = await schema.validate(request.query, { abortEarly: false })
  if (error) {
    return next(error)
  }

  const hash = hashObject(options) // Hash for this combination of options
  const ext = path.extname(file) // File extension e.g .jpg
  const basename = path.basename(file, ext) // Base file name
  const thumbnail = path.join(config.resizedImagesDir, `${basename}__${hash}${ext}`)

  if (!fs.existsSync(thumbnail)) {
    // Create image thumbnail
    await sharp(file)
      .resize(options)
      .toFile(thumbnail)
  }
  response.sendFile(thumbnail)
}

controller.audio = async (request, response) => {
  const { filePath } = request
  response.sendFile(filePath)
}

controller.info = async (request, response) => {
  const { filePath } = request
  const stat = promisify(fs.stat)
  const info = await stat(filePath)
  const result = { size: info.size }
  if (path.extname(filePath) === '.mp3') {
    const duration = await mp3Duration(filePath)
    result.duration = Math.round(duration * 1000) // Convert duration to milliseconds
  }
  response.json(result)
}

controller.validateFile = async (request, response, next) => {
  const filePath = path.join(config.uploadDir, request.params.file)
  const stat = promisify(fs.stat)
  if (!fs.existsSync(filePath)) {
    return response.sendStatus(404)
  }
  request.filePath = filePath
  next()
}

const router = express.Router()

router.param('file', awaited(controller.validateFile))
router.get('/image/:file', awaited(controller.image))
router.get('/audio/:file', awaited(controller.audio))
router.get('/info/:file', awaited(controller.info))

module.exports = router