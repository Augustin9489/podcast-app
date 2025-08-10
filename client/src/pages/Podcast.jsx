import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../lib/Auth'

export default function Podcast(){
  const { id } = useParams()
  const [pod, setPod] = useState(null)
  const [comments, setComments] = useState({})
  const { user } = useAuth()

  useEffect(()=>{
    api.get('/api/podcasts/'+id).then(r=>setPod(r.data)).catch(console.error)
    api.get('/api/episodes/comments').then(r=>setComments(r.data)).catch(()=>{})
  },[id])

  const postComment = async (episodeId, text) => {
    if(!text) return
    await api.post('/api/episodes/'+episodeId+'/comments', { text, user: user? user.email : 'guest' })
    const res = await api.get('/api/episodes/comments')
    setComments(res.data)
  }

  if(!pod) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <img src={pod.coverUrl} alt="" className="w-full md:w-64 h-64 object-cover rounded" />
        <div>
          <h1 className="text-2xl font-bold">{pod.title}</h1>
          <p className="text-sm text-gray-600 mt-2">{pod.description}</p>
          <div className="mt-4">
            <h2 className="font-semibold">Episodes</h2>
            <ul className="mt-2 space-y-2">
              {pod.episodes.map(ep=>(
                <li key={ep.id} className="p-2 border rounded flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <div className="font-medium">{ep.title}</div>
                    <div className="text-xs text-gray-500">{ep.duration} • {ep.publishedAt}</div>
                    <div className="mt-2">
                      <audio controls src={ep.audioUrl} onPause={(e)=> {
                        // save progress to server/localStorage
                        const pos = e.target.currentTime
                        localStorage.setItem('progress_'+ep.id, pos)
                        fetch('/api/progress', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({episodeId:ep.id, position:pos})})
                      }} />
                    </div>
                  </div>
                  <div className="md:w-40">
                    <CommentBox episodeId={ep.id} comments={comments[ep.id]||[]} onPost={postComment} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentBox({episodeId, comments, onPost}){
  const [txt, setTxt] = useState('')
  return (
    <div>
      <div className="text-sm font-semibold">Comments</div>
      <div className="max-h-40 overflow-auto text-xs mt-1">
        {(comments||[]).map((c,i)=><div key={i} className="p-1 border-b">{c.user}: {c.text}</div>)}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Add a comment" className="flex-1 p-1 border rounded text-sm" />
        <button onClick={()=>{ onPost(episodeId, txt); setTxt('') }} className="px-2 py-1 bg-blue-600 text-white rounded">Post</button>
      </div>
    </div>
  )
}
