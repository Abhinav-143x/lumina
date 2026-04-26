import { useState, useEffect, useRef } from 'react'
import api from '../api/client'

function NoteEditor({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [folder, setFolder] = useState(note?.folder || '')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [summary, setSummary] = useState(note?.summary || '')
  const [tagSuggestions, setTagSuggestions] = useState([])

  const save = async () => {
    setSaving(true)
    try {
      const payload = { title, content, folder }
      if (note?.id) {
        await api.patch(`/notes/${note.id}/`, payload)
      } else {
        await api.post('/notes/', payload)
      }
      onSave()
    } catch (e) {
      alert('Save failed: ' + JSON.stringify(e.response?.data))
    } finally { setSaving(false) }
  }

  const summarise = async () => {
    if (!note?.id) { alert('Save the note first.'); return }
    setAiLoading(true)
    try {
      const { data } = await api.post(`/notes/${note.id}/summarise/`)
      setSummary(data.summary)
    } finally { setAiLoading(false) }
  }

  const suggestTags = async () => {
    if (!note?.id) { alert('Save the note first.'); return }
    setAiLoading(true)
    try {
      const { data } = await api.post(`/notes/${note.id}/suggest-tags/`)
      setTagSuggestions(data.suggestions)
    } finally { setAiLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
        width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'auto', padding: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{note?.id ? 'Edit Note' : 'New Note'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={suggestTags} disabled={aiLoading}>◆ Suggest tags</button>
            <button className="btn btn-ghost btn-sm" onClick={summarise} disabled={aiLoading}>◆ Summarise</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        <input
          style={{ fontSize: 18, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 12, padding: '4px 0' }}
          placeholder="Note title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          style={{ fontSize: 12, marginBottom: 12, background: 'var(--surface2)' }}
          placeholder="Folder (optional)"
          value={folder}
          onChange={e => setFolder(e.target.value)}
        />

        <textarea
          style={{ minHeight: 320, resize: 'vertical', fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.7 }}
          placeholder="Write in markdown…"
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        {summary && (
          <div style={{ marginTop: 16, padding: 14, background: 'var(--accent-light)', border: '1px solid rgba(99,102,241,.3)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>◆ AI SUMMARY</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{summary}</div>
          </div>
        )}

        {tagSuggestions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>◆ Suggested tags:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tagSuggestions.map(t => <span key={t} className="tag-pill">{t}</span>)}
            </div>
          </div>
        )}

        {aiLoading && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 12 }}>◆ AI is thinking…</div>}
      </div>
    </div>
  )
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [folders, setFolders] = useState([])
  const [activeFolder, setActiveFolder] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (activeFolder) params.set('folder', activeFolder)
      const { data } = await api.get(`/notes/?${params}`)
      setNotes(data.results || data)
    } finally { setLoading(false) }
  }

  const loadFolders = async () => {
    try {
      const { data } = await api.get('/notes/folders/')
      setFolders(data.folders)
    } catch {}
  }

  useEffect(() => { load(); loadFolders() }, [search, activeFolder])

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return
    await api.delete(`/notes/${id}/`)
    load()
  }

  const openNew = () => { setEditing(null); setShowEditor(true) }
  const openEdit = (note) => { setEditing(note); setShowEditor(true) }
  const afterSave = () => { setShowEditor(false); load(); loadFolders() }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>◎ Notes</h1>
        <button className="btn btn-primary" onClick={openNew}>+ New Note</button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Sidebar: folders */}
        <div style={{ width: 160, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '.05em' }}>FOLDERS</div>
          {['', ...folders].map(f => (
            <button key={f || '__all'} onClick={() => setActiveFolder(f)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px',
                borderRadius: 6, fontSize: 13, marginBottom: 2, border: 'none',
                background: activeFolder === f ? 'var(--accent-light)' : 'transparent',
                color: activeFolder === f ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer',
              }}>
              {f || 'All notes'}
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1 }}>
          <input
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          {loading ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : notes.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              {search ? 'No notes match your search.' : 'No notes yet. Create your first one!'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {notes.map(n => (
                <div key={n.id} className="card" style={{ position: 'relative', cursor: 'pointer', transition: 'border-color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => openEdit(n)}
                >
                  {n.is_pinned && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 12 }}>📌</span>}
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, paddingRight: 20 }}>{n.title}</div>
                  {n.summary && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>{n.summary.slice(0, 100)}{n.summary.length > 100 ? '…' : ''}</div>}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {n.tags?.map(t => <span key={t.id} className="tag-pill">{t.name}</span>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {new Date(n.updated_at).toLocaleDateString()} · {n.word_count}w
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteNote(n.id) }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditor && <NoteEditor note={editing} onSave={afterSave} onClose={() => setShowEditor(false)} />}
    </div>
  )
}
