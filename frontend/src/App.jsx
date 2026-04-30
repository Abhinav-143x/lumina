import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
// Note: Login and Register are default exports from their respective files
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Habits from './pages/Habits'
import HabitDetail from './pages/HabitDetail'
import CalendarPage from './pages/CalendarPage'
import AIChat from './pages/AIChat'
import Reminders from './pages/Reminders'
import Layout from './components/Layout'

const isAuth = () => !!localStorage.getItem('access')

function Protected({ children }) {
  return isAuth() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="notes" element={<Notes />} />
        <Route path="habits" element={<Habits />} />
        <Route path="habits/:id" element={<HabitDetail />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="ai" element={<AIChat />} />
        <Route path="reminders" element={<Reminders />} />
      </Route>
    </Routes>
  )
}
