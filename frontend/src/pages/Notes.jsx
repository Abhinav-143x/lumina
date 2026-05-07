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
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4">
      <div className="bg-secondary border border-primary rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary">
          <div>
            <h2>{note?.id ? 'Edit Note' : 'New Note'}</h2>
            <p className="text-sm text-tertiary mt-1">Write in markdown format</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={suggestTags}
              disabled={aiLoading}
              className="btn btn-sm btn-ghost"
            >
              🤖 Suggest Tags
            </button>
            <button
              onClick={summarise}
              disabled={aiLoading}
              className="btn btn-sm btn-ghost"
            >
              ✨ Summarise
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-sm btn-primary"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none w-full"
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
            className="w-full min-h-[400px] resize-y font-mono text-sm"
          />

          {summary && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="text-sm font-semibold text-primary mb-2">✨ AI SUMMARY</div>
              <div className="text-sm">{summary}</div>
            </div>
          )}

          {tagSuggestions.length > 0 && (
            <div>
              <div className="text-sm text-tertiary mb-2">🏷️ Suggested tags:</div>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
      className="card cursor-pointer hover:border-accent/30 transition-colors"
      onClick={() => onEdit(note)}
    >
      {note.is_pinned && (
        <div className="absolute top-4 right-4 text-xl">📌</div>
      )}

      <h3 className="font-semibold text-lg mb-3 pr-8 line-clamp-2">{note.title}</h3>

      {note.summary && (
        <p className="text-sm text-secondary mb-4 line-clamp-3">
          {note.summary}
        </p>
      )}

      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag) => (
            <span key={tag.id} className="tag text-xs">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-primary">
        <span className="text-sm text-tertiary">
          {new Date(note.updated_at).toLocaleDateString()} · {note.word_count}w
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          className="btn btn-sm btn-ghost opacity-0 group-hover:opacity-100"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>📝 Notes</h1>
          <p className="text-sm text-secondary">Capture and organize your ideas</p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <span className="text-xl">+</span> New Note
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="text-xs font-semibold text-tertiary mb-3 tracking-wider uppercase">
            Folders
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder('')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                activeFolder === ''
                  ? 'bg-accent/10 text-primary border border-accent/20'
                  : 'text-secondary hover:bg-tertiary/50'
              }`}
            >
              📁 All Notes
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                  activeFolder === folder
                    ? 'bg-accent/10 text-primary border border-accent/20'
                    : 'text-secondary hover:bg-tertiary/50'
                }`}
              >
                📂 {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <div className="text-secondary">Loading...</div>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-secondary mb-6">
                {search
                  ? 'No notes match your search.'
                  : 'No notes yet. Create your first one!'}
              </p>
              {!search && (
                <button onClick={openNew} className="btn btn-secondary">
                  Create Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
