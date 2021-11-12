const shortid = require('shortid')
const ytdl = require('ytdl-core')
const path = require('path')
const fs = require('fs')
const config = require('../config')
const ffmpeg = require('ffmpeg')
const { connect, postMessage } = require('../utils/queue')

const QUEUE_TASK = 'download'
const QUEUE_COMPLETE = 'downloaded'
const QUEUE_PROGRESS = 'download_progress'
const MAX_CONCURRENCY = 5 // Downloads max 5 videos concurrently

// Downloads video from YouTube and convert
// them into mp3 files
async function downloadTask(msg, channel) {
  const task = JSON.parse(msg.content.toString('utf8'))

  // Helper function to update task progress
  const updateProgress = (current, total) =>
    postMessage({ task, current, total }, channel, QUEUE_PROGRESS)

  console.log('Start processing task:', task.id)
  updateProgress(0, 1)
  const videoId = task.videoId
  const link = `https://www.youtube.com/watch?v=${videoId}`
  const info = await ytdl.getBasicInfo(link, {
    format: 'audio',
    quality: 'highest',
  })

  // Name can have max 250 chars
  task.name = (task.name || info.videoDetails.title || '').slice(0, 250)
  task.description = task.description || info.videoDetails.description
  updateProgress(0, 1) // Update progress with new video info

  const basename = shortid.generate()
  const fileName = `${basename}.mp4`
  const mp4File = path.join(config.uploadDir, fileName)

  await new Promise((resolve, reject) => {
    console.log('Downloading video:', videoId)
    ytdl(link, { format: 'audio', quality: 'highest' })
      .on('error', (error) => {
        console.log('Download video error:', videoId)
        reject(error)
      })
      .on('progress', (_, current, total) => {
        updateProgress(current, total)
      })
      .on('finish', resolve)
      .pipe(fs.createWriteStream(mp4File))
  })
  console.log('Downloading video complete:', videoId)
  console.log('Converting mp4 to mp3:', videoId)
  const convert = await new ffmpeg(mp4File)
  const mp3FileName = `${basename}.mp3`
  const mp3File = path.join(config.uploadDir, mp3FileName)
  await convert.fnExtractSoundToMP3(mp3File)
  console.log('Video conversion complete:', videoId)
  // Delete video file
  fs.unlinkSync(mp4File)

  const result = {
    task,
    success: true,
    file: mp3FileName,
  }

  console.log('Task complete:', result)
  postMessage(result, channel, QUEUE_COMPLETE)
}

async function main() {
  const conn = await connect()
  const channel = await conn.createChannel()
  await channel.assertQueue(QUEUE_TASK)
  await channel.assertQueue(QUEUE_COMPLETE)
  await channel.assertQueue(QUEUE_PROGRESS, { messageTtl: 1000 })
  channel.prefetch(MAX_CONCURRENCY)
  channel.consume(
    QUEUE_TASK,
    (msg) =>
      downloadTask(msg, channel)
        .catch((error) => {
          const task = JSON.parse(msg.content.toString())
          const content = { task, success: false, message: error.message }
          postMessage(content, channel, QUEUE_COMPLETE)
          console.log(error)
        })
        .then(() => channel.ack(msg)),
    {
      noAck: false,
    }
  )
}

main().catch(console.log)
