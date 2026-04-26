import { useState, useEffect, useRef } from 'react'
import api from '../api/client'

const STARTERS = [
  'What habits should I focus on this week?',
  'Summarise my recent notes',
  'What do I have coming up on my calendar?',
  'Give me a productivity tip',
  'Help me plan my day',
  'What are my strongest habits?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom:16, alignItems:'flex-end', gap:8,
    }}>
      {!isUser && (
        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, marginBottom:2 }}>◆</div>
      )}
      <div style={{
        maxWidth:'72%', padding:'12px 16px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--accent)' : 'var(--surface2)',
        border: isUser ? 'none' : '1px solid var(--border)',
        fontSize:13, lineHeight:1.7,
        whiteSpace:'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const send = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const newMessages = [...messages, { role:'user', content }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const { data } = await api.post('/ai/chat/', { messages: newMessages })
      setMessages(m => [...m, { role:'assistant', content: data.reply }])
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content:'Sorry, something went wrong. Please check that your ANTHROPIC_API_KEY is set in .env.' }])
    } finally { setLoading(false) }
  }

  const clear = () => setMessages([])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>◆ AI Assistant</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>Context-aware — knows your notes, habits, and calendar</p>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clear}>Clear chat</button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', paddingRight:8, marginBottom:16 }}>
        {messages.length === 0 ? (
          <div>
            <div style={{ textAlign:'center', padding:'40px 0 32px' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>◆</div>
              <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Lumina AI</div>
              <div style={{ fontSize:13, color:'var(--muted)' }}>I know your notes, habits and calendar. Ask me anything.</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:540, margin:'0 auto' }}>
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{
                    padding:'10px 14px', borderRadius:10, fontSize:12, textAlign:'left',
                    background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)',
                    cursor:'pointer', lineHeight:1.5, transition:'border-color .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} msg={m} />)
        )}

        {loading && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginBottom:16 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>◆</div>
            <div style={{ padding:'12px 16px', borderRadius:'16px 16px 16px 4px', background:'var(--surface2)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:6, height:6, borderRadius:'50%', background:'var(--accent)',
                    animation:`bounce 1.2s ${i*0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink:0, display:'flex', gap:10, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'8px 8px 8px 16px' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
          style={{ flex:1, border:'none', background:'transparent', resize:'none', minHeight:44, maxHeight:120, lineHeight:1.6, fontSize:14, padding:'8px 0', borderRadius:0 }}
          rows={1}
        />
        <button className="btn btn-primary"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ alignSelf:'flex-end', borderRadius:8, padding:'10px 18px' }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
