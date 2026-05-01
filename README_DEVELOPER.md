# Lumina Developer Guide

Technical documentation for developers working on Lumina v2.0.

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Dashboard│ │  Notes   │ │  Habits  │ │ Calendar │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ AI Chat  │ │Reminders │ │ Templates│                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│  Modern Design System (CSS Variables + Utility Classes)      │
└─────────────────────────────────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Django 4.2 + DRF)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │   Auth   │ │  Notes   │ │  Habits  │ │ Calendar │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ AI Asst  │ │Reminders │ │ Templates│                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │  Claude API  │
│  (Data Store)│    │  (Cache/Broker)│   │   (AI Service)│
└──────────────┘    └──────────────┘    └──────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐    ┌──────────────┐
│   Celery     │    │  Celery Beat │
│   Worker     │    │  (Scheduler) │
└──────────────┘    └──────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | SPA with hot reload |
| **Design System** | Custom CSS + Variables | Modern, distinctive UI |
| **Backend** | Django 4.2 + DRF 3.15 | REST API framework |
| **Database** | PostgreSQL 15 | Primary data store |
| **Cache** | Redis 7 | Caching & message broker |
| **Tasks** | Celery 5.3 + Beat | Background processing |
| **AI** | Anthropic Claude API | AI features |
| **Charts** | Recharts 2.12 | Data visualization |
| **Container** | Docker + Compose | Development & deployment |

## 📁 Project Structure

```
lumina/
├── apps/                          # Django applications
│   ├── core/                      # Authentication (JWT, users)
│   │   ├── models.py              # User model extensions
│   │   ├── views.py               # Auth endpoints
│   │   └── urls.py                # Auth routes
│   ├── notes/                     # Notes system
│   │   ├── models.py              # Note, Tag, NoteTemplate models
│   │   ├── serializers.py         # DRF serializers
│   │   ├── views.py               # Note CRUD, templates
│   │   └── urls.py                # Note routes
│   ├── habits/                    # Habit tracking
│   │   ├── models.py              # Habit, HabitEntry models
│   │   ├── analytics.py           # Analytics computations
│   │   ├── serializers.py         # Habit serializers
│   │   ├── views.py               # Habit CRUD, analytics
│   │   └── urls.py                # Habit routes
│   ├── calendar_app/             # Calendar system
│   │   ├── models.py              # Event model
│   │   ├── views.py               # Event CRUD
│   │   └── urls.py                # Calendar routes
│   ├── ai_assistant/             # AI integration
│   │   ├── service.py             # Claude API wrapper
│   │   ├── views.py               # Chat, day planning
│   │   └── urls.py                # AI routes
│   └── reminders/                # Reminder system
│       ├── models.py              # ReminderSchedule, ReminderLog
│       ├── serializers.py         # Reminder serializers
│       ├── views.py               # Reminder CRUD, preferences
│       ├── email_service.py       # Email notification service
│       ├── celery_tasks.py        # Background task processing
│       └── urls.py                # Reminder routes
├── config/                        # Django configuration
│   ├── settings/
│   │   ├── base.py                # Base settings
│   │   ├── local.py               # Local development
│   │   └── production.py          # Production settings
│   ├── celery_app.py             # Celery configuration
│   ├── urls.py                    # Root URL configuration
│   └── wsgi.py                    # WSGI entry point
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   │   ├── Dashboard.jsx      # Main dashboard with stats
│   │   │   ├── Notes.jsx          # Notes CRUD with AI
│   │   │   ├── Habits.jsx         # Habit tracking
│   │   │   ├── HabitDetail.jsx    # Habit analytics
│   │   │   ├── CalendarPage.jsx   # Calendar management
│   │   │   ├── AIChat.jsx         # AI assistant
│   │   │   ├── Reminders.jsx      # Reminder management
│   │   │   ├── Login.jsx          # Authentication
│   │   │   └── Register.jsx       # User registration
│   │   ├── components/            # Reusable components
│   │   │   └── Layout.jsx        # Main layout with sidebar
│   │   ├── api/
│   │   │   └── client.js          # Axios with JWT handling
│   │   ├── index.css              # Design system & utilities
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── package.json              # Node dependencies
│   └── vite.config.js             # Vite configuration
├── docker-compose.yml             # Multi-container setup
├── Dockerfile                     # Backend container
├── requirements.txt               # Python dependencies
├── manage.py                      # Django management
└── .env.example                   # Environment variables template
```

## 🔧 Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose
- Anthropic API key

### Local Development

#### 1. Clone and Setup

```bash
git clone https://github.com/Abhinav-143x/lumina.git
cd lumina
cp .env.example .env
```

#### 2. Configure Environment

Edit `.env` with your settings:
```env
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-your-key
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### 3. Start Services

```bash
# Start all services
docker compose up --build

# Or start specific services
docker compose up api worker beat db redis
```

#### 4. Run Migrations

```bash
docker compose exec api python manage.py migrate
docker compose exec api python manage.py createsuperuser
```

#### 5. Access Services

- Frontend: http://localhost:5174
- API: http://localhost:8000
- Admin: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/docs/

## 🎨 Frontend Design System (v2.0)

### Design Philosophy

Lumina v2.0 features a distinctive, modern design system that avoids generic AI-generated aesthetics. The design focuses on:

- **Sophisticated Colors**: Deep blues and purples with vibrant accents
- **Modern Typography**: Clean hierarchy with proper spacing
- **Smooth Interactions**: Micro-animations and transitions throughout
- **Responsive Design**: Works beautifully on all screen sizes
- **Distinctive Identity**: Avoids generic purple-on-white AI aesthetics

### Color Palette

```css
/* Core Colors */
--bg-primary: #0a0e17;      /* Main background */
--bg-secondary: #111827;    /* Card backgrounds */
--bg-tertiary: #1f2937;     /* Elevated surfaces */
--bg-elevated: #1e2535;     /* Hover states */

/* Text Colors */
--text-primary: #f1f5f9;    /* Main text */
--text-secondary: #94a3b8;  /* Secondary text */
--text-tertiary: #64748b;   /* Muted text */
--text-muted: #475569;      /* Disabled text */

/* Accent Colors */
--accent-primary: #6366f1;  /* Main accent (indigo) */
--accent-secondary: #8b5cf6; /* Secondary accent (purple) */
--accent-tertiary: #a855f7;  /* Tertiary accent (violet) */
--accent-light: rgba(99, 102, 241, 0.15);
--accent-glow: rgba(99, 102, 241, 0.3);

/* Semantic Colors */
--success: #10b981;         /* Green */
--warning: #f59e0b;         /* Amber */
--error: #ef4444;           /* Red */
--info: #3b82f6;            /* Blue */

/* Border Colors */
--border-subtle: rgba(148, 163, 184, 0.1);
--border-default: rgba(148, 163, 184, 0.2);
--border-strong: rgba(148, 163, 184, 0.3);
--border-focus: rgba(99, 102, 241, 0.5);
```

### Typography Scale

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Font Sizes */
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-base { font-size: 14px; }
.text-lg { font-size: 16px; }
.text-xl { font-size: 18px; }
.text-2xl { font-size: 24px; }
.text-3xl { font-size: 30px; }
.text-4xl { font-size: 36px; }
.text-5xl { font-size: 48px; }
```

### Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

### Component Patterns

#### Cards
```jsx
<div className="card">
  {/* Card content */}
</div>
```

#### Buttons
```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-danger">Danger</button>
```

#### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
```

#### Tags
```jsx
<span className="tag-pill">Tag Name</span>
```

### Animations

```css
/* Fade In */
.animate-fade-in

/* Slide In */
.animate-slide-in

/* Pulse */
.animate-pulse

/* Custom animations with CSS variables */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Responsive Design

The design system is mobile-first with breakpoints:

```css
@media (max-width: 768px) {
  /* Mobile styles */
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

### Utility Classes

The design system includes comprehensive utility classes for:

- **Layout**: flex, grid, spacing, positioning
- **Typography**: font sizes, weights, colors
- **Colors**: backgrounds, text, borders
- **Effects**: shadows, transitions, transforms
- **Responsive**: breakpoints, visibility

All utility classes follow a consistent naming pattern and are defined in `frontend/src/index.css`.

### Design Guidelines

1. **Use CSS Variables**: Always use CSS variables for colors, spacing, and typography
2. **Semantic Colors**: Use semantic colors (success, warning, error) for status indicators
3. **Consistent Spacing**: Follow the spacing scale for consistent layouts
4. **Smooth Transitions**: Add transitions to all interactive elements
5. **Accessibility**: Ensure proper contrast ratios and keyboard navigation
6. **Responsive**: Test on multiple screen sizes
7. **Performance**: Use CSS transforms and opacity for animations

### Customization

To customize the design system:

1. Edit `frontend/src/index.css` to modify CSS variables
2. Add new utility classes following existing patterns
3. Update component styles to use new variables
4. Test across all pages for consistency

### Frontend Development

```bash
# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Backend Development

```bash
# Run Django server
python manage.py runserver

# Run Celery worker
celery -A config.celery_app worker --loglevel=info

# Run Celery beat
celery -A config.celery_app beat --loglevel=info
```

## 🗄️ Database Models

### Core Models

#### User (Extended)
- Standard Django User model
- JWT authentication via SimpleJWT
- Profile data in related models

#### Note
```python
class Note(models.Model):
    id = UUIDField(primary_key=True)
    user = ForeignKey(User)
    title = CharField(max_length=512)
    content = TextField()  # Markdown
    summary = TextField()  # AI-generated
    tags = ManyToMany(Tag)
    is_pinned = BooleanField(default=False)
    is_archived = BooleanField(default=False)
    folder = CharField(max_length=128)
    word_count = PositiveIntegerField(default=0)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### Habit
```python
class Habit(models.Model):
    id = UUIDField(primary_key=True)
    user = ForeignKey(User)
    name = CharField(max_length=255)
    description = TextField(blank=True)
    icon = CharField(max_length=50)
    color = CharField(max_length=7)
    category = CharField(max_length=100)
    frequency = CharField(max_length=50)
    target_count = PositiveIntegerField(default=1)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
```

#### Event
```python
class Event(models.Model):
    id = UUIDField(primary_key=True)
    user = ForeignKey(User)
    title = CharField(max_length=255)
    description = TextField(blank=True)
    start_datetime = DateTimeField()
    end_datetime = DateTimeField()
    all_day = BooleanField(default=False)
    color = CharField(max_length=7)
    location = CharField(max_length=255, blank=True)
    linked_note = ForeignKey(Note, null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

#### ReminderSchedule
```python
class ReminderSchedule(models.Model):
    id = UUIDField(primary_key=True)
    user = ForeignKey(User)
    reminder_type = CharField(choices=['event', 'habit', 'custom'])
    timing = CharField(choices=['15m', '30m', '1h', '2h', '24h', '3d'])
    event = ForeignKey(Event, null=True, blank=True)
    habit = ForeignKey(Habit, null=True, blank=True)
    custom_title = CharField(max_length=255, blank=True)
    custom_message = TextField(blank=True)
    custom_datetime = DateTimeField(null=True, blank=True)
    is_active = BooleanField(default=True)
    is_sent = BooleanField(default=False)
    sent_at = DateTimeField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

#### NoteTemplate
```python
class NoteTemplate(models.Model):
    id = UUIDField(primary_key=True)
    user = ForeignKey(User)
    name = CharField(max_length=255)
    description = TextField(blank=True)
    content = TextField()  # Markdown template
    category = CharField(max_length=100, blank=True)
    icon = CharField(max_length=50, blank=True)
    color = CharField(max_length=7, default='#6366f1')
    usage_count = PositiveIntegerField(default=0)
    is_favorite = BooleanField(default=False)
    is_system = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register/          # Register new user
POST   /api/v1/auth/login/            # Login (returns JWT)
POST   /api/v1/auth/token/refresh/    # Refresh access token
GET    /api/v1/auth/me/               # Get current user
PATCH  /api/v1/auth/me/               # Update user profile
```

### Notes
```
GET    /api/v1/notes/                 # List notes
POST   /api/v1/notes/                 # Create note
GET    /api/v1/notes/{id}/            # Get note
PATCH  /api/v1/notes/{id}/            # Update note
DELETE /api/v1/notes/{id}/            # Delete note
POST   /api/v1/notes/{id}/summarise/  # AI summarise
POST   /api/v1/notes/{id}/suggest-tags/  # AI tag suggestions
GET    /api/v1/notes/folders/         # List folders
GET    /api/v1/notes/tags/            # List tags
POST   /api/v1/notes/tags/            # Create tag
```

### Note Templates
```
GET    /api/v1/notes/templates/              # List templates
POST   /api/v1/notes/templates/              # Create template
GET    /api/v1/notes/templates/{id}/         # Get template
PATCH  /api/v1/notes/templates/{id}/         # Update template
DELETE /api/v1/notes/templates/{id}/         # Delete template
POST   /api/v1/notes/templates/{id}/use/     # Use template
POST   /api/v1/notes/templates/{id}/favorite/  # Toggle favorite
POST   /api/v1/notes/templates/{id}/duplicate/  # Duplicate template
GET    /api/v1/notes/templates/favorites/    # Get favorites
GET    /api/v1/notes/templates/system/       # Get system templates
```

### Habits
```
GET    /api/v1/habits/               # List habits
POST   /api/v1/habits/               # Create habit
GET    /api/v1/habits/{id}/          # Get habit
PATCH  /api/v1/habits/{id}/          # Update habit
DELETE /api/v1/habits/{id}/          # Delete habit
POST   /api/v1/habits/{id}/check-in/ # Mark complete
DELETE /api/v1/habits/{id}/check-in/ # Unmark complete
GET    /api/v1/habits/{id}/analytics/ # Full analytics
GET    /api/v1/habits/dashboard/     # Overview stats
POST   /api/v1/habits/ai-report/     # AI weekly insight
```

### Calendar
```
GET    /api/v1/calendar/events/      # List events
POST   /api/v1/calendar/events/      # Create event
GET    /api/v1/calendar/events/{id}/ # Get event
PATCH  /api/v1/calendar/events/{id}/ # Update event
DELETE /api/v1/calendar/events/{id}/ # Delete event
GET    /api/v1/calendar/upcoming/   # Next 10 events
```

### Reminders
```
GET    /api/v1/reminders/schedules/           # List reminders
POST   /api/v1/reminders/schedules/           # Create reminder
GET    /api/v1/reminders/schedules/{id}/      # Get reminder
PATCH  /api/v1/reminders/schedules/{id}/      # Update reminder
DELETE /api/v1/reminders/schedules/{id}/      # Delete reminder
POST   /api/v1/reminders/schedules/{id}/cancel/    # Cancel reminder
POST   /api/v1/reminders/schedules/{id}/reactivate/ # Reactivate reminder
GET    /api/v1/reminders/schedules/active/    # Get active reminders
GET    /api/v1/reminders/schedules/upcoming/  # Get upcoming reminders
GET    /api/v1/reminders/schedules/history/   # Get sent reminders
GET    /api/v1/reminders/logs/                # List reminder logs
GET    /api/v1/reminders/logs/recent/         # Recent logs
GET    /api/v1/reminders/logs/failed/         # Failed logs
GET    /api/v1/reminders/preferences/me/      # Get user preferences
PUT    /api/v1/reminders/preferences/me/      # Update preferences
```

### AI Assistant
```
POST   /api/v1/ai/chat/              # Multi-turn chat
GET    /api/v1/ai/plan-day/          # Generate day plan
```

## 🤖 AI Integration

### Claude API Service

All AI calls are centralized in `apps/ai_assistant/service.py`:

```python
def ai_summarise(content: str) -> str:
    """Summarise a note in 2–3 sentences."""
    return _call(
        system="You are a concise note summariser...",
        user=f"Summarise this note:\n\n{content[:4000]}",
    )

def ai_suggest_tags(title: str, content: str) -> list[str]:
    """Return up to 5 tag suggestions."""
    raw = _call(
        system='You suggest short lowercase tags...',
        user=f"Title: {title}\n\nContent: {content[:2000]}",
    )
    return json.loads(raw)

def ai_chat(messages: list[dict], context: dict) -> str:
    """Multi-turn chat with user context."""
    system = f"You are Lumina, an intelligent second-brain assistant..."
    msg = _client().messages.create(
        model=settings.AI_MODEL,
        max_tokens=600,
        system=system,
        messages=messages[-10:],
    )
    return msg.content[0].text.strip()
```

### AI Models

Configure in `.env`:
```env
AI_MODEL=claude-haiku-4-5-20251001  # Fast, cost-effective
# or
AI_MODEL=claude-sonnet-4-6-20250514  # Higher quality
```

## 🔄 Background Tasks

### Celery Tasks

Located in `apps/reminders/celery_tasks.py`:

```python
@shared_task
def process_due_reminders():
    """Process all due reminders that need to be sent."""
    # Runs frequently (e.g., every minute)
    # Checks for due reminders and sends emails

@shared_task
def create_event_reminders(event_id):
    """Create default reminders for a new event."""
    # Triggered when event is created
    # Creates reminder based on user preferences

@shared_task
def send_daily_habit_reminders():
    """Send daily reminders for all active habits."""
    # Runs once per day (e.g., at 8 AM)
    # Sends reminders for habits not yet completed today

@shared_task
def cleanup_old_reminder_logs(days=30):
    """Clean up old reminder logs."""
    # Maintenance task to prevent database bloat
```

### Celery Beat Schedule

Configure periodic tasks in Django Admin:
1. Go to `/admin/`
2. Navigate to "Periodic tasks"
3. Create "Crontab Schedule" or "Interval Schedule"
4. Create "Periodic Task" pointing to your Celery task

## 📊 Analytics Engine

### Habit Analytics

Located in `apps/habits/analytics.py`:

```python
def get_streak(habit: Habit) -> dict:
    """Calculate current and longest streak."""
    # Returns: {'current': 5, 'longest': 12}

def get_completion_rate(habit: Habit, days: int) -> float:
    """Calculate completion rate for time window."""
    # Returns: 0.75 (75% completion)

def get_heatmap_data(habit: Habit, year: int) -> list:
    """Generate GitHub-style heatmap data."""
    # Returns: [{'date': '2024-01-01', 'count': 1, 'level': 1}, ...]

def get_weekly_bar_data(habit: Habit, weeks: int) -> list:
    """Generate weekly completion vs target data."""
    # Returns: [{'week': 1, 'completed': 5, 'target': 7, 'rate': 71.4}, ...]
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
docker compose exec api python manage.py test

# Run specific app tests
docker compose exec api python manage.py test apps.notes

# Run with coverage
docker compose exec api coverage run --source='.' manage.py test
docker compose exec api coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Collect static files
docker compose exec api python manage.py collectstatic

# Run migrations
docker compose exec api python manage.py migrate
```

### Environment Variables

Required for production:
```env
SECRET_KEY=production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
POSTGRES_DB=lumina_prod
POSTGRES_USER=lumina_user
POSTGRES_PASSWORD=secure-password
ANTHROPIC_API_KEY=sk-ant-production-key
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=production@yourdomain.com
EMAIL_HOST_PASSWORD=secure-email-password
```

### Docker Production

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

## 🔒 Security

### Authentication
- JWT tokens with 8-hour access token lifetime
- 7-day refresh token lifetime
- Token refresh endpoint
- User-scoped data isolation

### API Security
- All endpoints require authentication (except register/login)
- Rate limiting: 20/minute for anonymous, 120/minute for authenticated
- CORS configured for frontend domain
- SQL injection protection via Django ORM

### Data Protection
- Passwords hashed with Django's default hasher
- User data isolated by user_id
- No sensitive data in logs
- Environment variables for secrets

## 🐛 Debugging

### Backend Debugging

```bash
# Enable Django debug
DEBUG=True

# Check logs
docker compose logs api
docker compose logs worker
docker compose logs beat

# Django shell
docker compose exec api python manage.py shell

# Database access
docker compose exec db psql -U postgres lumina
```

### Frontend Debugging

```bash
# Check browser console for errors
# Network tab for API calls
# React DevTools for component state

# Clear cache
rm -rf node_modules/.vite
```

### Celery Debugging

```bash
# Check Celery logs
docker compose logs worker

# Inspect active tasks
docker compose exec api celery -A config.celery_app inspect active

# Purge all tasks
docker compose exec api celery -A config.celery_app purge
```

## 📈 Performance

### Database Optimization
- Use `select_related()` for foreign keys
- Use `prefetch_related()` for many-to-many
- Add database indexes for frequent queries
- Use pagination for large datasets

### Caching Strategy
- Redis for session storage
- Cache frequently accessed data
- Cache AI responses when appropriate
- Use `@cache_page` decorator for views

### Frontend Optimization
- Code splitting with React.lazy()
- Lazy load images
- Minimize bundle size
- Use production build

## 🤝 Contributing

### Code Style
- Python: Follow PEP 8
- JavaScript: Use ESLint configuration
- React: Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

### Git Workflow
1. Create feature branch from `master`
2. Make changes and commit with descriptive messages
3. Test thoroughly
4. Push to remote
5. Create pull request
6. Request code review
7. Merge after approval

### Commit Messages
```
feat: add note templates system
fix: resolve reminder email delivery issue
docs: update API documentation
refactor: improve analytics performance
test: add unit tests for habit calculations
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Recharts Documentation](https://recharts.org/)

## 🆘 Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check if PostgreSQL is running
docker compose ps db

# Restart database
docker compose restart db
```

**Celery tasks not running**
```bash
# Check worker status
docker compose ps worker

# Restart worker
docker compose restart worker

# Check Redis connection
docker compose exec redis redis-cli ping
```

**Frontend not connecting to API**
```bash
# Check API is running
curl http://localhost:8000/api/v1/auth/me/

# Check CORS settings
# Verify ALLOWED_HOSTS in settings
```

**Email not sending**
```bash
# Check email configuration
# Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
# Test with console backend first
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

## 📞 Support

For technical support:
- Check existing issues on GitHub
- Review API documentation at `/api/docs/`
- Examine logs in Docker containers
- Enable DEBUG mode for detailed error messages