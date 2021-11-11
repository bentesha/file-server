const express = require('express')
const { awaited } = require('../utils/express')
const { connect } = require('../utils/queue')

const controller = {}

controller.yt = async (request, response) => {
  const videoId = request.params.id
  const task = {
    videoId,
    seriesId: 'my_series_id',
    sequence: 1,
    title: 'Some title',
    description: 'Some description'
  }
  const msg = Buffer.from(JSON.stringify(task))
  const conn = await connect()
  const channel = await conn.createChannel()
  await channel.assertQueue('download')
  channel.sendToQueue('download', msg)
  response.sendStatus(200)
}

const router = express.Router()
router.post('/yt/:id', awaited(controller.yt))

module.exports = router