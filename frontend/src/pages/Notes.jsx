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
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-secondary border border-subtle rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div>
            <h2 className="text-lg font-semibold">{note?.id ? 'Edit Note' : 'New Note'}</h2>
            <p className="text-xs text-tertiary mt-1">Write in markdown format</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={suggestTags}
              disabled={aiLoading}
              className="btn btn-ghost btn-sm"
            >
              🤖 Suggest Tags
            </button>
            <button
              onClick={summarise}
              disabled={aiLoading}
              className="btn btn-ghost btn-sm"
            >
              ✨ Summarise
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
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
            className="text-2xl font-bold bg-transparent border-none outline-none w-full placeholder:text-tertiary"
          />

          <input
            type="text"
            placeholder="Folder (optional)"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full"
          />

          <textarea
            placeholder="Write your note here... (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[400px] resize-y font-mono text-sm leading-relaxed"
          />

          {summary && (
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="text-xs font-semibold text-accent mb-2">✨ AI SUMMARY</div>
              <div className="text-sm leading-relaxed">{summary}</div>
            </div>
          )}

          {tagSuggestions.length > 0 && (
            <div>
              <div className="text-xs text-tertiary mb-2">🏷️ Suggested tags:</div>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 text-sm text-accent">
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
      className="card group cursor-pointer hover:scale-[1.02] transition-all duration-200"
      onClick={() => onEdit(note)}
    >
      {note.is_pinned && (
        <div className="absolute top-4 right-4 text-lg">📌</div>
      )}

      <h3 className="font-semibold text-base mb-2 pr-6 line-clamp-2">{note.title}</h3>

      {note.summary && (
        <p className="text-sm text-secondary leading-relaxed mb-3 line-clamp-3">
          {note.summary}
        </p>
      )}

      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {note.tags.map((tag) => (
            <span key={tag.id} className="tag-pill text-xs">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-subtle">
        <span className="text-xs text-tertiary">
          {new Date(note.updated_at).toLocaleDateString()} · {note.word_count}w
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">📝 Notes</h1>
          <p className="text-secondary">Capture and organize your ideas</p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <span className="text-lg">+</span> New Note
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="text-xs font-semibold text-tertiary mb-3 tracking-wider">
            FOLDERS
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeFolder === ''
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-secondary hover:bg-tertiary/50'
              }`}
            >
              📁 All Notes
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFolder === folder
                    ? 'bg-accent/10 text-accent font-medium'
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
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-secondary mb-4">
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