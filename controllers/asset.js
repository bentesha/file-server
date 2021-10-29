const express = require('express')
const config = require('../config')
const path = require('path')
const fs = require('fs')
const { hashObject } = require('../utils/crypto')
const { awaited } = require('../utils/express')
const sharp = require('sharp')
const Joi = require('joi')

const controller = {}

controller.image = async (request, response, next) => {
  const file = path.join(config.uploadDir, request.params.file)
  if (!fs.existsSync(file)) {
    return response.sendStatus(404)
  }

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
  const file = request.params.file
  const filePath = path.join(config.uploadDir, file)

  if (!fs.existsSync) {
    return response.sendStatus(404)
  }
  response.sendFile(filePath)
}

const router = express.Router()

router.get('/image/:file', awaited(controller.image))
router.get('/audio/:file', awaited(controller.audio))

module.exports = router