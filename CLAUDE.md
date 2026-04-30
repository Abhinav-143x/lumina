# Lumina — AI-Powered Second Brain

## Project Overview

Lumina is a full-stack productivity application that combines **notes with AI summarisation**, **habit tracking with analytics**, **calendar with reminders**, and an **AI assistant** that knows your entire context. It's designed as a "second brain" to help users organize their thoughts, track their habits, and get AI-powered insights.

## What's Been Built

### Core Features Implemented

#### 📝 Notes System
- **Full CRUD operations** for notes with markdown content
- **AI-powered summarisation** - one-click 2-3 sentence summaries using Claude API
- **AI tag suggestions** - automatic tag recommendations based on content
- **Folder organization** with filtering capabilities
- **Full-text search** across titles, content, and tags
- **Pin and archive** functionality for better organization
- **Word count tracking** automatically calculated on save
- **Note templates** - reusable templates with categories, icons, and usage tracking
- **Template management** - create, favorite, duplicate, and use templates

**Key Models:**
- `Note` - UUID-based primary key, user-owned, with title, content, summary, tags, pin/archive status, folder, word count
- `Tag` - User-specific tags with color coding
- `NoteTemplate` - Reusable note templates with categories, usage tracking, and favorites

**API Endpoints:**
- `GET/POST /api/v1/notes/` - List/create notes
- `GET/PATCH/DELETE /api/v1/notes/<id>/` - Note detail operations
- `POST /api/v1/notes/<id>/summarise/` - AI summarisation
- `POST /api/v1/notes/<id>/suggest-tags/` - AI tag suggestions
- `GET /api/v1/notes/folders/` - List folders
- `GET/POST /api/v1/notes/tags/` - Tag management
- `GET/POST /api/v1/notes/templates/` - Template CRUD operations
- `POST /api/v1/notes/templates/<id>/use/` - Use template to create note
- `POST /api/v1/notes/templates/<id>/favorite/` - Toggle favorite status
- `POST /api/v1/notes/templates/<id>/duplicate/` - Duplicate template
- `GET /api/v1/notes/templates/favorites/` - Get favorite templates
- `GET /api/v1/notes/templates/system/` - Get system templates

#### ✅ Habits Tracking System
- **Daily check-in system** with streak tracking
- **GitHub-style contribution heatmap** for full-year view
- **Weekly bar charts** showing target vs. completed habits
- **Completion rate trends** for 7d/30d/90d windows
- **AI weekly insight reports** with coaching tips
- **Per-habit customization** - color, icon, category, frequency settings

**Key Models:**
- `Habit` - User-defined habits with name, description, color, icon, category, target frequency
- `HabitEntry` - Daily check-in records with completion status

**Analytics Engine** (`apps/habits/analytics.py`):
- Computes current and longest streaks
- Calculates completion rates for configurable time windows
- Generates full-year heatmap data (like GitHub contributions)
- Creates 12-week bar chart data with percentage trends

**API Endpoints:**
- `GET/POST /api/v1/habits/` - List/create habits
- `GET/PATCH/DELETE /api/v1/habits/<id>/` - Habit detail operations
- `POST/DELETE /api/v1/habits/<id>/check-in/` - Mark habits complete/incomplete
- `GET /api/v1/habits/<id>/analytics/` - Full analytics data
- `GET /api/v1/habits/dashboard/` - Overview statistics
- `POST /api/v1/habits/ai-report/` - AI weekly insights

#### 📅 Calendar System
- **Month-view calendar** with color-coded events
- **Event CRUD operations** with date-time picker
- **Event-note linking** capabilities
- **Upcoming events widget** on dashboard
- **Automatic reminder creation** for new events based on user preferences

**Key Models:**
- `Event` - Calendar events with title, description, start/end times, color, note links

**API Endpoints:**
- `GET/POST /api/v1/calendar/events/` - List/create events
- `GET/PATCH/DELETE /api/v1/calendar/events/<id>/` - Event detail operations
- `GET /api/v1/calendar/upcoming/` - Next 10 upcoming events

#### 🔔 Reminder System
- **Email notifications** for events, habits, and custom reminders
- **Customizable timing** - 15min, 30min, 1h, 2h, 24h, 3d before
- **User notification preferences** - control what types of reminders you receive
- **Quiet hours** - no notifications during specific times
- **Reminder history** - track all sent reminders with logs
- **Automatic reminder creation** for events and habits
- **Celery-based processing** - reliable background task execution

**Key Models:**
- `ReminderSchedule` - Reminder configurations with timing and status
- `ReminderLog` - Delivery history and error tracking
- `UserNotificationPreferences` - User-specific notification settings

**API Endpoints:**
- `GET/POST /api/v1/reminders/schedules/` - List/create reminders
- `GET/PATCH/DELETE /api/v1/reminders/schedules/<id>/` - Reminder detail operations
- `POST /api/v1/reminders/schedules/<id>/cancel/` - Cancel reminder
- `POST /api/v1/reminders/schedules/<id>/reactivate/` - Reactivate reminder
- `GET /api/v1/reminders/schedules/active/` - Get active reminders
- `GET /api/v1/reminders/schedules/upcoming/` - Get upcoming reminders
- `GET /api/v1/reminders/schedules/history/` - Get sent reminders
- `GET /api/v1/reminders/logs/` - List reminder logs
- `GET /api/v1/reminders/logs/recent/` - Recent logs
- `GET /api/v1/reminders/logs/failed/` - Failed logs
- `GET/PUT /api/v1/reminders/preferences/me/` - User preferences

**Celery Tasks:**
- `process_due_reminders()` - Process and send due reminders
- `create_event_reminders()` - Create reminders for new events
- `create_habit_reminders()` - Create reminders for new habits
- `send_daily_habit_reminders()` - Daily habit reminder notifications
- `cleanup_old_reminder_logs()` - Maintenance task for log cleanup

#### 🤖 AI Assistant
- **Context-aware Claude-powered chat** with conversation history
- **Day planner** generating personalized schedules from calendar + habits
- **Habit coaching** via AI reports
- **Suggested conversation starters** for quick access
- **Multi-turn conversation support** with context awareness

**AI Service** (`apps/ai_assistant/service.py`):
- Centralized Anthropic API integration
- Functions for summarisation, tag suggestions, habit insights, day planning, and chat
- Error handling and fallback responses
- Context injection for personalized responses

**API Endpoints:**
- `POST /api/v1/ai/chat/` - Multi-turn chat with context
- `GET /api/v1/ai/plan-day/` - Generate daily schedule

#### 🔐 Authentication System
- **JWT-based authentication** with access and refresh tokens
- **User registration and login** endpoints
- **Profile management** with GET/PATCH operations
- **Token refresh mechanism** for extended sessions

**API Endpoints:**
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login (returns JWT)
- `POST /api/v1/auth/token/refresh/` - Refresh access token
- `GET/PATCH /api/v1/auth/me/` - Profile management

### Frontend Implementation

**React SPA with Vite** featuring:
- **Dashboard** with overview widgets and quick actions
- **Notes page** with markdown editor, folder organization, search
- **Habits page** with list view and individual habit detail pages
- **Calendar page** with month view and event management
- **AI Chat page** with conversation interface and suggested starters
- **Reminders page** with full reminder management UI
- **Responsive layout** with sidebar navigation

**Key Libraries:**
- React 18 + React Router for SPA routing
- Recharts for data visualization (habit analytics)
- Axios for API communication with JWT auto-refresh
- date-fns for date manipulation
- react-markdown for note rendering
- Lucide React for icons

### Infrastructure & DevOps

**Docker-based development environment:**
- 6-service architecture: api, worker, beat, db, redis, frontend
- PostgreSQL 15 for data persistence
- Redis 7 for caching and Celery broker
- Celery 5.3 for background task processing
- Celery Beat for scheduled tasks
- Health checks and service dependencies

**Development workflow:**
- Hot-reload development with volume mounts
- Environment-based configuration
- Comprehensive docker-compose setup
- Ready for production deployment

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

## Project Structure

```
lumina/
├── apps/
│   ├── core/               # Auth: register, login, JWT, /me
│   ├── notes/              # Notes CRUD + AI summarise/tag + templates
│   ├── habits/             # Habit CRUD + check-in + analytics engine
│   ├── calendar_app/       # Events CRUD + upcoming view
│   ├── ai_assistant/       # Claude API service + chat + day planner
│   └── reminders/          # Reminder system + email notifications
├── config/
│   ├── settings/           # base.py / local.py / production.py
│   ├── celery_app.py       # Celery entrypoint
│   └── urls.py
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── pages/          # Dashboard, Notes, Habits, HabitDetail, Calendar, AIChat, Reminders
│       ├── components/     # Layout (sidebar navigation)
│       └── api/client.js   # Axios with JWT auto-refresh
├── docker-compose.yml      # api + worker + beat + db + redis + frontend
└── requirements.txt
```

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

## Development Guidelines

### Environment Setup

1. **Prerequisites**: Docker + Docker Compose, Anthropic API key
2. **Configuration**: Copy `.env.example` to `.env` and add your API key
3. **Start services**: `docker compose up --build`
4. **Run migrations**: `docker compose exec api python manage.py migrate`
5. **Create user**: `docker compose exec api python manage.py createsuperuser`

### Code Organization

- **Keep AI logic centralized** in `apps/ai_assistant/service.py`
- **Analytics computations** belong in `apps/habits/analytics.py`
- **Follow Django conventions** for app structure (models, views, urls, serializers)
- **Frontend components** should be reusable and follow React best practices
- **API endpoints** follow RESTful conventions with proper HTTP methods

### Key Patterns

**AI Integration:**
- All AI calls go through `apps/ai_assistant/service.py`
- Functions are synchronous and return plain Python types
- Error handling with fallback responses
- Context injection for personalized AI responses

**Analytics:**
- Pure Python computations from database models
- No external analytics services required
- Configurable time windows for completion rates
- Efficient data structures for frontend visualization

**Authentication:**
- JWT-based with access and refresh tokens
- Auto-refresh mechanism in frontend API client
- User-scoped data isolation throughout the system

### Testing Strategy

- **Unit tests** for analytics computations
- **Integration tests** for API endpoints
- **Frontend tests** for critical user flows
- **AI mocking** for reliable testing without API calls

## Future Development Possibilities

### High Priority Enhancements

**1. Advanced Note Features**
- Implement note linking and backreferences
- Support file attachments and images
- Add collaborative note sharing
- Enhanced rich text editor with formatting options
- Note versioning and history

**2. Enhanced Analytics**
- Add habit comparison and leaderboards
- Implement goal tracking and progress visualization
- Create exportable reports (PDF, CSV)
- Add long-term trend analysis
- Custom analytics dashboards

**3. AI Improvements**
- Implement note content search and Q&A
- Add habit optimization suggestions
- Create smart scheduling recommendations
- Implement voice input/output capabilities
- AI-powered content organization

**4. Mobile Experience**
- Progressive Web App (PWA) support
- Offline functionality with service workers
- Mobile-optimized UI components
- Push notification support
- Touch-friendly interfaces

### Medium Priority Features

**5. Integration Capabilities**
- Calendar sync (Google Calendar, Outlook)
- Note export to various formats (Markdown, PDF)
- Webhook support for external integrations
- API for third-party developers
- Import/export functionality

**6. Social Features**
- Habit sharing and accountability partners
- Community templates and workflows
- Achievement badges and gamification
- Public profile sharing
- Social feed and activity

**7. Performance & Scalability**
- Implement database query optimization
- Add caching layer for frequently accessed data
- Implement pagination for large datasets
- Add rate limiting and API throttling
- Load balancing and horizontal scaling

### Technical Improvements

**8. Security Enhancements**
- Add two-factor authentication
- Implement audit logging
- Add data encryption for sensitive content
- Implement backup and recovery procedures
- Security headers and CSP

**9. Developer Experience**
- Add comprehensive API documentation
- Create SDK for popular languages
- Implement webhooks for real-time updates
- Add debugging and monitoring tools
- Performance profiling tools

**10. Advanced Features**
- Real-time collaboration with WebSockets
- Advanced search with filters and sorting
- Custom themes and appearance
- Keyboard shortcuts and power user features
- Advanced automation and scripting

### Long-term Vision

**11. Advanced AI Features**
- Personalized AI models trained on user data
- Predictive habit suggestions
- Automated content organization
- Natural language command processing

**12. Enterprise Features**
- Team workspaces and collaboration
- Advanced permission management
- SSO integration
- Compliance and reporting tools

## Release History

### v1.5 - Enhanced Productivity (April 2026)

**Major Features Added:**

**🔔 Complete Reminder System**
- Email notifications for events, habits, and custom reminders
- Customizable timing options (15min, 30min, 1h, 2h, 24h, 3d before)
- User notification preferences with type-specific controls
- Quiet hours functionality for personalized schedules
- Reminder history and delivery logs
- Automatic reminder creation for events and habits
- Celery-based background processing for reliable delivery

**📝 Note Templates System**
- Reusable note templates with categories and organization
- Template metadata: icons, colors, descriptions
- Usage tracking and statistics
- Favorite templates for quick access
- Template duplication and sharing
- System templates for common use cases
- Template-to-note creation workflow

**🎨 Frontend Enhancements**
- New Reminders page with comprehensive UI
- Create and manage custom reminders
- Notification preferences interface
- Template management integration
- Enhanced navigation and user experience

**Technical Improvements:**
- Email service with HTML template rendering
- Celery task scheduling and processing
- Reminder preference management system
- Enhanced admin interfaces
- Improved error handling and logging
- Database optimizations for reminder queries

**API Additions:**
- 8 new reminder management endpoints
- 6 new template management endpoints
- Enhanced user preference endpoints
- Comprehensive logging and history endpoints

**Statistics:**
- 22 files changed with 1,625 insertions
- 4 new database models
- 5 new Celery tasks
- 14 new API endpoints
- 1 new frontend page

### v1.0 - Foundation Release (March 2026)

**Core Features:**
- Full authentication system with JWT
- Notes CRUD with AI summarisation and tagging
- Habits tracking with comprehensive analytics
- Calendar with event management
- AI assistant with context-aware chat
- Docker-based development environment
- Responsive React frontend

## Current Status

**v1.5 Completed (April 2026):**
- ✅ Full authentication system with JWT
- ✅ Notes CRUD with AI summarisation and tagging
- ✅ Note templates system with categories and usage tracking
- ✅ Habits tracking with comprehensive analytics
- ✅ Calendar with event management
- ✅ AI assistant with context-aware chat
- ✅ Complete reminder system with email notifications
- ✅ User notification preferences and quiet hours
- ✅ Celery-based task scheduling and processing
- ✅ Docker-based development environment
- ✅ Responsive React frontend with Reminders page

**v1.0 Completed:**
- ✅ Core application infrastructure
- ✅ All basic CRUD operations
- ✅ AI integration foundation
- ✅ Analytics engine
- ✅ Frontend navigation and layout

**Next Steps for v2.0:**
- Note-to-note linking and backreferences
- Enhanced rich text editor
- Advanced analytics and reporting
- Mobile PWA experience
- AI-powered search and Q&A
- Third-party integrations

## Contributing

When contributing to Lumina:

1. **Follow existing patterns** - Look at similar features for guidance
2. **Keep AI calls centralized** - Use `apps/ai_assistant/service.py`
3. **Test thoroughly** - Ensure new features don't break existing functionality
4. **Document changes** - Update relevant documentation and API specs
5. **Consider performance** - Optimize database queries and API responses

## License

MIT License - See LICENSE file for details