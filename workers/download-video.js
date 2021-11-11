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
  console.log('Start processing task:', task.id)
  const videoId = task.videoId
  const link = `https://www.youtube.com/watch?v=${videoId}`
  const info = await ytdl.getBasicInfo(link, {
    format: 'audio',
    quality: 'highest',
  })
  const title = info.videoDetails.title
  const description = info.videoDetails.description
  const basename = shortid.generate()
  const fileName = `${basename}.mp4`
  const mp4File = path.join(config.uploadDir, fileName)

  await new Promise((resolve, reject) => {
    console.log('Downloading video:', videoId)
    ytdl(link, { format: 'audio', quality: 'highest' })
      .on('error', (error) => {
        console.log('Download video error:', videoId)
        console.log(error)
        const msg = { task, success: false, message: error.message }
        postMessage(msg, channel, QUEUE_COMPLETE)
        reject(error)
      })
      .on('progress', (_, current, total) => {
        const msg = { task, current, total }
        postMessage(msg, channel, QUEUE_PROGRESS)
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
    title,
    success: true,
    description: description || '',
    file: mp3FileName,
  }

  console.log('Task complete:', result)
  postMessage(result, channel, QUEUE_COMPLETE)
}

async function main() {
  const conn = await connect()
  const channel = await conn.createChannel()
  channel.prefetch(MAX_CONCURRENCY)
  channel.consume(
    QUEUE_TASK,
    (msg) =>
      downloadTask(msg, channel)
        .catch((error) => {
          console.log(error)
        })
        .then(() => channel.ack(msg)),
    {
      noAck: false,
    }
  )
}

main().catch(console.log)
