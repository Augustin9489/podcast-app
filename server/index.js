const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')
const app = express()
app.use(cors())
app.use(express.json())
const UPLOAD_DIR = path.join(__dirname,'uploads')
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR) },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
})
const upload = multer({ storage })

let sample = require('./sample.json')
let comments = {}  // { episodeId: [ {user, text, at} ] }
let progress = {}  // { sessionId: { episodeId: position } }

app.get('/api/podcasts', (req, res) => res.json(sample.podcasts))
app.get('/api/podcasts/:id', (req, res) => {
  const p = sample.podcasts.find(x=>x.id === req.params.id)
  if(!p) return res.status(404).json({error:'not found'})
  res.json(p)
})

app.post('/api/upload', upload.fields([{name:'audio'},{name:'cover'}]), (req, res) => {
  // simple flow: attach uploaded audio as a new episode to the first podcast (demo)
  const title = req.body.title || 'Untitled'
  const description = req.body.description || ''
  const audioFile = req.files['audio'] && req.files['audio'][0]
  const coverFile = req.files['cover'] && req.files['cover'][0]
  if(!audioFile) return res.status(400).json({error:'audio required'})
  const episode = {
    id: uuidv4(),
    title,
    description,
    audioUrl: '/uploads/' + path.basename(audioFile.path),
    duration: '00:00',
    publishedAt: new Date().toISOString().slice(0,10)
  }
  // append to first podcast for demo purposes
  sample.podcasts[0].episodes.push(episode)
  return res.json({ok:true, podcastId: sample.podcasts[0].id, episode})
})

app.use('/uploads', express.static(UPLOAD_DIR))

app.get('/api/episodes/comments', (req, res) => res.json(comments))
app.post('/api/episodes/:episodeId/comments', (req, res) => {
  const ep = req.params.episodeId
  const { user, text } = req.body
  if(!comments[ep]) comments[ep] = []
  comments[ep].push({ user: user || 'guest', text, at: new Date().toISOString() })
  res.json({ok:true})
})

app.post('/api/progress', (req, res) => {
  const { sessionId, episodeId, position } = req.body
  const sid = sessionId || req.ip
  if(!progress[sid]) progress[sid] = {}
  progress[sid][episodeId] = position
  res.json({ok:true})
})

app.get('/api/rss/:podcastId', (req, res) => {
  // generate a simple RSS feed XML for the podcast
  const p = sample.podcasts.find(x=>x.id===req.params.podcastId)
  if(!p) return res.status(404).send('Not found')
  let items = p.episodes.map(e=>`
  <item>
    <title><![CDATA[${e.title}]]></title>
    <description><![CDATA[${e.description||''}]]></description>
    <enclosure url="${req.protocol}://${req.get('host')}${e.audioUrl || ''}" type="audio/mpeg" />
    <pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>
    <guid>${e.id}</guid>
  </item>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"><channel>
  <title>${p.title}</title>
  <description>${p.description}</description>
  ${items}
  </channel></rss>`
  res.type('application/xml').send(xml)
})

const port = process.env.PORT || 5173
app.listen(port, ()=> console.log('Server listening on', port))
