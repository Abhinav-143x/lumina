import { useState, useEffect } from 'react'
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
    } finally {
      setSaving(false)
    }
  }

  const summarise = async () => {
    if (!note?.id) {
      alert('Save the note first.')
      return
    }
    setAiLoading(true)
    try {
      const { data } = await api.post(`/notes/${note.id}/summarise/`)
      setSummary(data.summary)
    } finally {
      setAiLoading(false)
    }
  }

  const suggestTags = async () => {
    if (!note?.id) {
      alert('Save the note first.')
      return
    }
    setAiLoading(true)
    try {
      const { data } = await api.post(`/notes/${note.id}/suggest-tags/`)
      setTagSuggestions(data.suggestions)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        width: '100%',
        maxWidth: '48rem',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h2>{note?.id ? 'Edit Note' : 'New Note'}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Write in markdown format</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={suggestTags}
              disabled={aiLoading}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              🤖 Suggest Tags
            </button>
            <button
              onClick={summarise}
              disabled={aiLoading}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              ✨ Summarise
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%'
            }}
          />

          <input
            type="text"
            placeholder="Folder (optional)"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          />

          <textarea
            placeholder="Write your note here... (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '400px',
              resize: 'vertical',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          />

          {summary && (
            <div style={{
              padding: '1rem',
              borderRadius: '0.375rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary)', marginBottom: '0.5rem' }}>✨ AI SUMMARY</div>
              <div style={{ fontSize: '0.875rem' }}>{summary}</div>
            </div>
          )}

          {tagSuggestions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🏷️ Suggested tags:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tagSuggestions.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '0.75rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aiLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)' }}>
              <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AI is thinking...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div
      className="card"
      style={{ cursor: 'pointer', position: 'relative' }}
      onClick={() => onEdit(note)}
    >
      {note.is_pinned && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.25rem' }}>📌</div>
      )}

      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '0.75rem',
        paddingRight: '2rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {note.title}
      </h3>

      {note.summary && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {note.summary}
        </p>
      )}

      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {note.tags.map((tag) => (
            <span key={tag.id} style={{
              fontSize: '0.75rem',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {new Date(note.updated_at).toLocaleDateString()} · {note.word_count}w
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          className="btn-ghost"
          style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', opacity: 0 }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          🗑️
        </button>
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
    } finally {
      setLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const { data } = await api.get('/notes/folders/')
      setFolders(data.folders)
    } catch {}
  }

  useEffect(() => {
    load()
    loadFolders()
  }, [search, activeFolder])

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return
    await api.delete(`/notes/${id}/`)
    load()
  }

  const openNew = () => {
    setEditing(null)
    setShowEditor(true)
  }

  const openEdit = (note) => {
    setEditing(note)
    setShowEditor(true)
  }

  const afterSave = () => {
    setShowEditor(false)
    load()
    loadFolders()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>📝 Notes</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Capture and organize your ideas</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <span style={{ fontSize: '1.25rem' }}>+</span> New Note
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Sidebar */}
        <div style={{ width: '224px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Folders
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button
              onClick={() => setActiveFolder('')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                background: activeFolder === '' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeFolder === '' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: activeFolder === '' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📁 All Notes
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  background: activeFolder === folder ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: activeFolder === folder ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: activeFolder === folder ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                📂 {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <svg
              style={{ width: '20px', height: '20px', position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid var(--primary)',
                  borderTop: 'transparent',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  animation: 'spin 1s linear infinite'
                }} />
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {search
                  ? 'No notes match your search.'
                  : 'No notes yet. Create your first one!'}
              </p>
              {!search && (
                <button onClick={openNew} className="btn-secondary">
                  Create Note
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEdit}
                  onDelete={deleteNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <NoteEditor note={editing} onSave={afterSave} onClose={() => setShowEditor(false)} />
      )}
    </div>
  )
}
