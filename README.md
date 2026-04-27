# Lumina — AI-Powered Second Brain

![Django](https://img.shields.io/badge/Django-4.2-green?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Celery](https://img.shields.io/badge/Celery-5.3-brightgreen?style=flat-square)
![Redis](https://img.shields.io/badge/Redis-7-red?style=flat-square&logo=redis)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)
![AI](https://img.shields.io/badge/AI-Claude%20API-purple?style=flat-square)

A full-stack productivity app combining **notes with AI summarisation**, **habit tracking with analytics**, **calendar with reminders**, and an **AI assistant** that knows your entire context.

---

## Features

## ✨ Lumina in Action
### Dashboard
![Dashboard](screenshots/Dashboard-Dark.png)

### Habits Tracker
![Habits](screenshots/habits.png)

### Calendar & Events
![Calendar](screenshots/calendar.png)

### 📝 Notes
- Markdown editor with folder organisation
- AI-powered summarisation (one click → 2-3 sentence summary)
- AI tag suggestion
- Full-text search across title, content and tags
- Pin, archive, folder filter

### ✅ Habits
- Daily check-in with streak tracking
- **GitHub-style contribution heatmap** (full year view)
- Weekly bar chart with target vs. completed
- Completion rate trend line (7d / 30d / 90d)
- AI weekly insight report: coaching tips based on your data
- Per-habit colour, icon, category, frequency settings

### 📅 Calendar
- Month-view calendar with colour-coded events
- Create/edit/delete events with date-time picker
- Link events to notes
- Upcoming events widget on dashboard
- Celery Beat reminder infrastructure (extend to send email/push)

### 🤖 AI Assistant
- Context-aware Claude-powered chat
- Knows your note count, habit names, upcoming events
- Day planner: generates a personalised schedule from your calendar + habits
- Habit coaching via `/ai-report/` endpoint
- Suggested starters for quick access

---

## Architecture

```
Browser (React + Vite)
        │  REST API
        ▼
Django 4.2 + DRF ──► PostgreSQL (notes, habits, events, users)
        │
        ├──► Redis ──► Celery Worker (background tasks)
        │         └──► Celery Beat (scheduled reminders)
        │
        └──► Anthropic Claude API (summarise, tag, chat, plan)
```

---

## Project Structure

```
lumina/
├── apps/
│   ├── core/               # Auth: register, login, JWT, /me
│   ├── notes/              # Notes CRUD + AI summarise/tag
│   ├── habits/             # Habit CRUD + check-in + analytics engine
│   ├── calendar_app/       # Events CRUD + upcoming view
│   └── ai_assistant/       # Claude API service + chat + day planner
├── config/
│   ├── settings/           # base.py / local.py / production.py
│   ├── celery_app.py       # Celery entrypoint
│   └── urls.py
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── pages/          # Dashboard, Notes, Habits, HabitDetail, Calendar, AIChat
│       ├── components/     # Layout (sidebar navigation)
│       └── api/client.js   # Axios with JWT auto-refresh
├── docker-compose.yml      # api + worker + beat + db + redis + frontend
└── requirements.txt
```

---

## Quick Start

### Prerequisites
- Docker + Docker Compose
- An Anthropic API key (get one at https://console.anthropic.com)

### 1. Clone and configure

```bash
git clone https://github.com/YOUR_USERNAME/lumina.git
cd lumina
cp .env.example .env
```

Edit `.env`:
```
SECRET_KEY=your-random-secret-key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 2. Start all services

```bash
docker compose up --build
```

This starts 6 services: `api`, `worker`, `beat`, `db`, `redis`, `frontend`

### 3. Run migrations and create a user

```bash
docker compose exec api python manage.py migrate
docker compose exec api python manage.py createsuperuser
```

### 4. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | React frontend |
| `http://localhost:8000/api/docs/` | Swagger UI |
| `http://localhost:8000/admin/` | Django Admin |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Register new user |
| POST | `/api/v1/auth/login/` | Login (returns JWT) |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token |
| GET/PATCH | `/api/v1/auth/me/` | Profile |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/notes/` | List or create notes |
| GET/PATCH/DELETE | `/api/v1/notes/<id>/` | Note detail |
| POST | `/api/v1/notes/<id>/summarise/` | AI summarise |
| POST | `/api/v1/notes/<id>/suggest-tags/` | AI tag suggestions |
| GET | `/api/v1/notes/folders/` | List folders |
| GET/POST | `/api/v1/notes/tags/` | Tags |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/habits/` | List or create habits |
| GET/PATCH/DELETE | `/api/v1/habits/<id>/` | Habit detail |
| POST/DELETE | `/api/v1/habits/<id>/check-in/` | Mark done / unmark |
| GET | `/api/v1/habits/<id>/analytics/` | Full analytics (heatmap, streaks, bars) |
| GET | `/api/v1/habits/dashboard/` | Overview stats |
| POST | `/api/v1/habits/ai-report/` | AI weekly insight |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/calendar/events/` | List or create events |
| GET/PATCH/DELETE | `/api/v1/calendar/events/<id>/` | Event detail |
| GET | `/api/v1/calendar/upcoming/` | Next 10 upcoming events |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/chat/` | Context-aware multi-turn chat |
| GET | `/api/v1/ai/plan-day/` | Generate today's day plan |

---

## Analytics Engine

`apps/habits/analytics.py` computes:

- **Streak** — current and longest consecutive-day streak
- **Completion rate** — configurable window (7d / 30d / 90d)
- **Heatmap data** — full year of daily completions (like GitHub contributions)
- **Weekly bar data** — 12-week completed vs. target with percentage trend

All computed in pure Python from the `HabitEntry` table — no external analytics service needed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | Django 4.2 + DRF 3.15 |
| Auth | SimpleJWT (access + refresh tokens) |
| Database | PostgreSQL 15 |
| Cache / broker | Redis 7 |
| Background tasks | Celery 5.3 + Celery Beat |
| AI | Anthropic Claude API |
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Container | Docker + Docker Compose |
| API docs | drf-spectacular (OpenAPI 3 / Swagger) |

---

## License
MIT
