const express = require('express')
const busboy = require('connect-busboy')
const path = require('path')
const fs = require('fs-extra')
const shortid = require('shortid')
const config = require('../config')
const { awaited } = require('../utils/express')

const controller = {}

controller.upload = async (request, response) => {
  request.pipe(request.busboy)
  request.busboy.on('file', (fieldName, file, fileName) => {
    const ext = path.extname(fileName)
    //Generate random file name
    fileName = `${shortid.generate()}${ext}`
    const filePath = path.join(config.uploadDir, fileName)
    const stream = fs.createWriteStream(filePath)
    file.pipe(stream)
    stream.on('close', () => {
      response.json({
        status: 200,
        message: 'Success',
        id: fileName
      })
    })
  })
}

const router = express.Router()

router.post('/', busboy(), awaited(controller.upload))

module.exports = router