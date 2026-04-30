import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Clock, Bell, Calendar, CheckCircle, XCircle, Settings } from 'lucide-react';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history, logs

  useEffect(() => {
    fetchReminders();
    fetchPreferences();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get('/api/v1/reminders/schedules/active/');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/v1/reminders/preferences/me/');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const cancelReminder = async (id) => {
    try {
      await axios.post(`/api/v1/reminders/schedules/${id}/cancel/`);
      fetchReminders();
    } catch (error) {
      console.error('Error canceling reminder:', error);
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5" />;
      case 'habit':
        return <Clock className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getReminderColor = (type) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'habit':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600 mt-1">Manage your notifications and alerts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Reminder
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['active', 'history', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
            <p className="text-gray-500 mb-4">Create your first reminder to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Reminder
            </button>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getReminderColor(reminder.reminder_type)}`}>
                    {getReminderIcon(reminder.reminder_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {reminder.reminder_type === 'event' && reminder.event_title}
                      {reminder.reminder_type === 'habit' && reminder.habit_name}
                      {reminder.reminder_type === 'custom' && reminder.custom_title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {reminder.reminder_type_display} • {reminder.timing_display}
                    </p>
                    {reminder.custom_datetime && (
                      <p className="text-sm text-gray-500">
                        Scheduled for: {new Date(reminder.custom_datetime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reminder.is_sent ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => cancelReminder(reminder.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel reminder"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Reminder</h2>
            <CreateReminderForm
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                fetchReminders();
              }}
            />
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && preferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
            <PreferencesForm
              preferences={preferences}
              onClose={() => setShowPreferencesModal(false)}
              onSuccess={() => {
                setShowPreferencesModal(false);
                fetchPreferences();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CreateReminderForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    reminder_type: 'custom',
    timing: '1h',
    custom_title: '',
    custom_message: '',
    custom_datetime: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/v1/reminders/schedules/', {
        ...formData,
        custom_datetime: formData.custom_datetime || new Date(Date.now() + 3600000).toISOString(),
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Type</label>
        <select
          value={formData.reminder_type}
          onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="custom">Custom Reminder</option>
          <option value="event">Event Reminder</option>
          <option value="habit">Habit Reminder</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.custom_title}
          onChange={(e) => setFormData({ ...formData, custom_title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={formData.custom_message}
          onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">When</label>
        <select
          value={formData.timing}
          onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="15m">15 minutes before</option>
          <option value="30m">30 minutes before</option>
          <option value="1h">1 hour before</option>
          <option value="2h">2 hours before</option>
          <option value="24h">1 day before</option>
          <option value="3d">3 days before</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For</label>
        <input
          type="datetime-local"
          value={formData.custom_datetime}
          onChange={(e) => setFormData({ ...formData, custom_datetime: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Reminder'}
        </button>
      </div>
    </form>
  );
};

const PreferencesForm = ({ preferences, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...preferences });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/v1/reminders/preferences/me/', formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Email Notifications</h3>
          <p className="text-sm text-gray-500">Receive reminders via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.email_enabled}
            onChange={(e) => setFormData({ ...formData, email_enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Reminder Types</h4>
        {[
          { key: 'email_event_reminders', label: 'Event Reminders' },
          { key: 'email_habit_reminders', label: 'Habit Reminders' },
          { key: 'email_custom_reminders', label: 'Custom Reminders' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Default Timing</h4>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Event Reminders</label>
          <select
            value={formData.default_event_timing}
            onChange={(e) => setFormData({ ...formData, default_event_timing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="15m">15 minutes before</option>
            <option value="30m">30 minutes before</option>
            <option value="1h">1 hour before</option>
            <option value="2h">2 hours before</option>
            <option value="24h">1 day before</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Habit Reminders</label>
          <select
            value={formData.default_habit_timing}
            onChange={(e) => setFormData({ ...formData, default_habit_timing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="15m">15 minutes before</option>
            <option value="30m">30 minutes before</option>
            <option value="1h">1 hour before</option>
            <option value="2h">2 hours before</option>
            <option value="24h">1 day before</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default Reminders;