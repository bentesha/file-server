const client = require('amqplib')
const config = require('../config')

exports.connect = function () {
  return client.connect({
    host: config.rabbitmq.host,
  })
}

exports.initQueues = async function () {
  const conn = await exports.connect()
  const channel = await conn.createChannel()
  const queues = ['download', 'downloaded']
  for (const q in queues) {
    await channel.assertQueue(q, { durable: true })
  }
  await channel.assertQueue('download_progress', { messageTtl: 1000 })
  await channel.close()
  await conn.close()
}

exports.postMessage = function (msg, channel, queue) {
  return channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)))
}
