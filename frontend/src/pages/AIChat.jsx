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
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-sm font-bold flex-shrink-0">
          🤖
        </div>
      )}
      <div
        className={`max-w-[72%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-accent to-secondary text-white rounded-2xl rounded-tr-sm'
            : 'bg-tertiary/50 border border-subtle rounded-2xl rounded-tl-sm'
        }`}
      >
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const { data } = await api.post('/ai/chat/', { messages: newMessages })
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Sorry, something went wrong. Please check that your ANTHROPIC_API_KEY is set in .env.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clear = () => setMessages([])

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-2">🤖 AI Assistant</h1>
          <p className="text-secondary">
            Context-aware — knows your notes, habits, and calendar
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} className="btn btn-ghost btn-sm">
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Lumina AI</h3>
            <p className="text-secondary mb-8">
              I know your notes, habits and calendar. Ask me anything.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => send(starter)}
                  className="p-4 rounded-xl bg-tertiary/30 border border-subtle text-left text-sm hover:border-accent/30 hover:bg-tertiary/50 transition-all"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} msg={m} />)
        )}

        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-sm font-bold">
              🤖
            </div>
            <div className="px-4 py-3 bg-tertiary/50 border border-subtle rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-accent animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="flex gap-3 bg-tertiary/30 border border-subtle rounded-xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent border-none resize-none min-h-[44px] max-h-[120px] leading-relaxed text-sm p-2"
            rows={1}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn btn-primary self-end"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}