import { useState, useEffect } from 'react'
import api from '../api/client'

const TIMING_OPTIONS = [
  { value: '15m', label: '15 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '2h', label: '2 hours before' },
  { value: '24h', label: '1 day before' },
  { value: '3d', label: '3 days before' },
]

function CreateReminderForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    reminder_type: 'custom',
    timing: '1h',
    custom_title: '',
    custom_message: '',
    custom_datetime: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/reminders/schedules/', {
        ...formData,
        custom_datetime:
          formData.custom_datetime ||
          new Date(Date.now() + 3600000).toISOString(),
      })
      onSuccess()
    } catch (error) {
      console.error('Error creating reminder:', error)
      alert('Failed to create reminder')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-secondary border border-subtle rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-6">Create New Reminder</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Reminder Type
            </label>
            <select
              value={formData.reminder_type}
              onChange={(e) => handleChange('reminder_type')(e.target.value)}
            >
              <option value="custom">Custom Reminder</option>
              <option value="event">Event Reminder</option>
              <option value="habit">Habit Reminder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.custom_title}
              onChange={(e) => handleChange('custom_title')(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Message
            </label>
            <textarea
              value={formData.custom_message}
              onChange={(e) => handleChange('custom_message')(e.target.value)}
              className="min-h-[70px]"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              When
            </label>
            <select
              value={formData.timing}
              onChange={(e) => handleChange('timing')(e.target.value)}
            >
              {TIMING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Schedule For
            </label>
            <input
              type="datetime-local"
              value={formData.custom_datetime}
              onChange={(e) => handleChange('custom_datetime')(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PreferencesForm({ preferences, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ ...preferences })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put('/reminders/preferences/me/', formData)
      onSuccess()
    } catch (error) {
      console.error('Error updating preferences:', error)
      alert('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-secondary border border-subtle rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-tertiary">Receive reminders via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_enabled}
                onChange={(e) => handleChange('email_enabled')(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
            </label>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Reminder Types</h4>
            {[
              { key: 'email_event_reminders', label: 'Event Reminders' },
              { key: 'email_habit_reminders', label: 'Habit Reminders' },
              { key: 'email_custom_reminders', label: 'Custom Reminders' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => handleChange(key)(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Default Timing</h4>
            <div>
              <label className="block text-sm mb-2">Event Reminders</label>
              <select
                value={formData.default_event_timing}
                onChange={(e) =>
                  handleChange('default_event_timing')(e.target.value)
                }
              >
                {TIMING_OPTIONS.slice(0, 5).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Habit Reminders</label>
              <select
                value={formData.default_habit_timing}
                onChange={(e) =>
                  handleChange('default_habit_timing')(e.target.value)
                }
              >
                {TIMING_OPTIONS.slice(0, 5).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReminderCard({ reminder, onCancel }) {
  const getReminderIcon = (type) => {
    switch (type) {
      case 'event':
        return '📅'
      case 'habit':
        return '✅'
      default:
        return '🔔'
    }
  }

  const getReminderColor = (type) => {
    switch (type) {
      case 'event':
        return 'from-info/20 to-blue-600/20 border-info/30'
      case 'habit':
        return 'from-success/20 to-emerald-600/20 border-success/30'
      default:
        return 'from-accent/20 to-secondary/20 border-accent/30'
    }
  }

  return (
    <div className="card group hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl flex-shrink-0 ${getReminderColor(
            reminder.reminder_type
          )}`}
        >
          {getReminderIcon(reminder.reminder_type)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1">
            {reminder.reminder_type === 'event' && reminder.event_title}
            {reminder.reminder_type === 'habit' && reminder.habit_name}
            {reminder.reminder_type === 'custom' && reminder.custom_title}
          </h3>
          <p className="text-sm text-tertiary mb-2">
            {reminder.reminder_type_display} • {reminder.timing_display}
          </p>
          {reminder.custom_datetime && (
            <p className="text-xs text-tertiary">
              Scheduled for:{' '}
              {new Date(reminder.custom_datetime).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {reminder.is_sent ? (
            <span className="flex items-center gap-1 text-sm text-success">
              ✓ Sent
            </span>
          ) : (
            <button
              onClick={() => onCancel(reminder.id)}
              className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
              title="Cancel reminder"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchReminders()
    fetchPreferences()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await api.get('/reminders/schedules/active/')
      setReminders(response.data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/reminders/preferences/me/')
      setPreferences(response.data)
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const cancelReminder = async (id) => {
    try {
      await api.post(`/reminders/schedules/${id}/cancel/`)
      fetchReminders()
    } catch (error) {
      console.error('Error canceling reminder:', error)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">🔔 Reminders</h1>
          <p className="text-secondary">Manage your notifications and alerts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="btn btn-ghost"
          >
            ⚙️ Preferences
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <span className="text-lg">+</span> New Reminder
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-subtle">
        <nav className="flex gap-6">
          {['active', 'history', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="font-semibold mb-2">No reminders yet</h3>
            <p className="text-secondary mb-4">Create your first reminder to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Reminder
            </button>
          </div>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onCancel={cancelReminder}
            />
          ))
        )}
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <CreateReminderForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchReminders()
          }}
        />
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && preferences && (
        <PreferencesForm
          preferences={preferences}
          onClose={() => setShowPreferencesModal(false)}
          onSuccess={() => {
            setShowPreferencesModal(false)
            fetchPreferences()
          }}
        />
      )}
    </div>
  )
}