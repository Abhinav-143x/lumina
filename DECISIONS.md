# Lumina Decision Log

**Project:** Lumina - AI-Powered Second Brain
**Last Updated:** May 1, 2026
**Current Version:** v2.0

This document captures all significant architectural, design, and technical decisions made throughout the Lumina project's development.

---

## 🏗️ Architecture Decisions

### Decision 1: Technology Stack Selection

**Context:** Initial project setup for a full-stack productivity application

**Options Considered:**
1. **MERN Stack** (MongoDB, Express, React, Node)
2. **Django + React** (Chosen)
3. **Next.js Full-Stack**
4. **Vue.js + Laravel**

**Decision:** Django + React with Docker

**Rationale:**
- **Django**: Excellent for rapid development, built-in admin interface, strong ORM, great REST API support via DRF
- **React**: Component-based architecture, large ecosystem, excellent for complex UIs
- **Docker**: Consistent development environment, easy deployment, service isolation
- **Separation of Concerns**: Clear frontend/backend separation allows independent scaling

**Trade-offs:**
- **Pros**: Mature ecosystem, strong community support, excellent documentation
- **Cons**: Slightly heavier than MERN, learning curve for Django ORM

**Impact:** High - foundational decision affecting entire project structure

---

### Decision 2: Database Choice

**Context:** Data persistence layer for notes, habits, events, users

**Options Considered:**
1. **PostgreSQL** (Chosen)
2. **MySQL**
3. **MongoDB**
4. **SQLite**

**Decision:** PostgreSQL 15

**Rationale:**
- **Relational Features**: Complex queries, joins, and transactions needed
- **Data Integrity**: Foreign key constraints, ACID compliance
- **Advanced Features**: JSON support, full-text search, indexing
- **Production Ready**: Proven scalability and reliability
- **Django Support**: Excellent Django integration

**Trade-offs:**
- **Pros**: Robust, feature-rich, excellent performance
- **Cons**: More complex setup than SQLite, requires separate service

**Impact:** High - affects data modeling and query capabilities

---

### Decision 3: Background Task Processing

**Context:** Need for email notifications, scheduled reminders, and async processing

**Options Considered:**
1. **Celery + Redis** (Chosen)
2. **Django Background Tasks**
3. **RQ (Redis Queue)**
4. **Custom Thread-based Solution**

**Decision:** Celery 5.3 with Redis 7 and Celery Beat

**Rationale:**
- **Mature Solution**: Industry-standard for Python background tasks
- **Feature Rich**: Task scheduling, retries, monitoring, distributed processing
- **Scalability**: Easy to add workers for high-volume processing
- **Beat Scheduler**: Built-in periodic task scheduling
- **Redis Integration**: Fast message broker with persistence

**Trade-offs:**
- **Pros**: Reliable, feature-complete, excellent monitoring
- **Cons**: Additional infrastructure complexity, requires Redis

**Impact:** High - enables reliable reminder system and async processing

---

### Decision 4: AI Service Integration

**Context:** AI-powered features (summarisation, tag suggestions, chat, day planning)

**Options Considered:**
1. **Anthropic Claude API** (Chosen)
2. **OpenAI GPT API**
3. **Local LLM (Ollama)**
4. **Multiple Provider Support**

**Decision:** Anthropic Claude API with centralized service layer

**Rationale:**
- **Quality**: Superior context understanding and response quality
- **Cost**: Competitive pricing with good performance
- **API Design**: Clean, well-documented API with good error handling
- **Context Window**: Large context window for comprehensive understanding
- **Centralization**: Single service layer for maintainability

**Trade-offs:**
- **Pros**: High quality, good pricing, excellent documentation
- **Cons**: Vendor lock-in, API dependency

**Impact:** High - core differentiator and user experience driver

---

## 🎨 Frontend Design Decisions

### Decision 5: Design System Approach

**Context:** Complete frontend redesign for v2.0

**Options Considered:**
1. **Tailwind CSS** (Rejected - port conflict issues)
2. **Custom CSS with Variables** (Chosen)
3. **CSS-in-JS (Styled Components)**
4. **Material UI / Ant Design**

**Decision:** Custom CSS with comprehensive CSS variables

**Rationale:**
- **Control**: Complete control over design without framework constraints
- **Performance**: No runtime overhead, smaller bundle size
- **Maintainability**: Centralized design tokens in CSS variables
- **Distinctiveness**: Avoid generic component library aesthetics
- **Port Conflicts**: Avoided Tailwind CSS conflicts with other projects

**Trade-offs:**
- **Pros**: Lightweight, fast, complete control, distinctive
- **Cons**: More initial setup, no pre-built components

**Impact:** High - defines entire visual identity and user experience

---

### Decision 6: Color Palette Strategy

**Context:** Visual identity and user experience design

**Options Considered:**
1. **Light Theme** (Rejected)
2. **Dark Theme** (Chosen)
3. **System Preference Detection**
4. **Theme Switching**

**Decision:** Sophisticated dark theme with deep blues and vibrant accents

**Rationale:**
- **Modern Aesthetic**: Dark themes are contemporary and reduce eye strain
- **Professional**: Deep colors convey sophistication and focus
- **Contrast**: High contrast for readability and accessibility
- **Distinctiveness**: Avoids generic purple-on-white AI aesthetics
- **Focus**: Dark backgrounds help users concentrate on content

**Trade-offs:**
- **Pros**: Modern, professional, good for long sessions, distinctive
- **Cons**: May not suit all users, no light option

**Impact:** Medium - affects visual identity and user preference

---

### Decision 7: Component Architecture

**Context:** Frontend component structure and organization

**Options Considered:**
1. **Atomic Design** (Atoms, Molecules, Organisms)
2. **Feature-Based Components** (Chosen)
3. **Page-Based Components**
4. **Container/Presentational Pattern**

**Decision:** Feature-based components with reusable UI elements

**Rationale:**
- **Simplicity**: Easy to understand and maintain
- **Reusability**: Common components (buttons, cards, modals) shared across features
- **Feature Focus**: Components organized by feature area
- **Scalability**: Easy to add new features without restructuring

**Trade-offs:**
- **Pros**: Simple, maintainable, scalable, feature-focused
- **Cons**: Less formal than atomic design, potential duplication

**Impact:** Medium - affects code organization and maintainability

---

### Decision 8: State Management

**Context:** Managing application state across components

**Options Considered:**
1. **Redux** (Rejected)
2. **Context API** (Rejected)
3. **Local Component State** (Chosen)
4. **Zustand / Jotai**

**Decision:** Local component state with API calls

**Rationale:**
- **Simplicity**: No additional complexity for current needs
- **Performance**: Avoids unnecessary re-renders
- **API-First**: State primarily driven by API responses
- **Scalability**: Easy to add state management if needed later
- **Learning Curve**: Lower barrier for contributors

**Trade-offs:**
- **Pros**: Simple, fast, easy to understand, no boilerplate
- **Cons**: Prop drilling for deep component trees, no global state

**Impact:** Low - current complexity doesn't require advanced state management

---

## 🔧 Backend Design Decisions

### Decision 9: API Design Pattern

**Context:** RESTful API structure and conventions

**Options Considered:**
1. **REST** (Chosen)
2. **GraphQL**
3. **gRPC**
4. **Custom API**

**Decision:** RESTful API with Django REST Framework

**Rationale:**
- **Standard**: Well-understood, widely adopted
- **Django Integration**: Excellent DRF support with serializers
- **Documentation**: Auto-generated API docs with drf-spectacular
- **Caching**: Built-in caching support
- **Testing**: Easy to test with standard HTTP methods

**Trade-offs:**
- **Pros**: Standard, well-documented, excellent tooling, easy testing
- **Cons**: Over-fetching/under-fetching, less flexible than GraphQL

**Impact:** High - defines API contract and client integration

---

### Decision 10: Authentication Strategy

**Context**: User authentication and authorization

**Options Considered:**
1. **Session-Based** (Rejected)
2. **JWT Tokens** (Chosen)
3. **OAuth2 / OpenID Connect**
4. **Custom Token System**

**Decision**: JWT with SimpleJWT (access + refresh tokens)

**Rationale:**
- **Stateless**: No server-side session storage
- **Scalability**: Easy to scale horizontally
- **Mobile-Friendly**: Works well with mobile apps
- **Security**: Short-lived access tokens with refresh mechanism
- **Standard**: Well-understood security model

**Trade-offs:**
- **Pros**: Scalable, stateless, secure, mobile-friendly
- **Cons**: Token revocation complexity, slightly larger requests

**Impact:** High - affects security model and client integration

---

### Decision 11: Data Modeling Approach

**Context**: Database schema design for notes, habits, events, reminders

**Options Considered:**
1. **Normalized Schema** (Chosen)
2. **Denormalized Schema**
3. **Document-Based (NoSQL)**
4. **Hybrid Approach**

**Decision**: Normalized relational schema with strategic denormalization

**Rationale:**
- **Data Integrity**: Foreign key constraints ensure consistency
- **Flexibility**: Complex queries and relationships
- **Performance**: Proper indexing and query optimization
- **Maintainability**: Clear schema structure and relationships
- **Analytics**: Easier to generate reports and insights

**Trade-offs:**
- **Pros**: Data integrity, flexibility, performance, maintainability
- **Cons**: More complex queries, potential join overhead

**Impact:** High - affects data integrity and query capabilities

---

## 🤖 AI Integration Decisions

### Decision 12: AI Service Architecture

**Context**: How to integrate AI features across the application

**Options Considered:**
1. **Direct API Calls in Views** (Rejected)
2. **Centralized Service Layer** (Chosen)
3. **AI-Specific Microservice**
4. **Plugin Architecture**

**Decision**: Centralized service layer in `apps/ai_assistant/service.py`

**Rationale:**
- **Maintainability**: Single point of contact for AI operations
- **Consistency**: Uniform error handling and response formatting
- **Testing**: Easy to mock and test AI functionality
- **Configuration**: Centralized API key and model management
- **Monitoring**: Easy to add logging and analytics

**Trade-offs:**
- **Pros**: Maintainable, consistent, testable, configurable
- **Cons**: Single point of failure, potential bottleneck

**Impact:** High - affects AI feature reliability and maintainability

---

### Decision 13: AI Model Selection

**Context**: Which Claude model to use for different features

**Options Considered:**
1. **Claude Haiku** (Fast, cost-effective)
2. **Claude Sonnet** (Higher quality)
3. **Claude Opus** (Best quality)
4. **Dynamic Selection** (Chosen)

**Decision**: Configurable model selection with Haiku as default

**Rationale:**
- **Cost Optimization**: Haiku is significantly cheaper for most operations
- **Performance**: Faster response times for better UX
- **Flexibility**: Easy to upgrade to Sonnet for quality-critical features
- **Scalability**: Cost-effective as user base grows
- **Quality**: Haiku provides sufficient quality for most use cases

**Trade-offs:**
- **Pros**: Cost-effective, fast, flexible, scalable
- **Cons**: Lower quality than Opus, requires configuration

**Impact:** Medium - affects costs and user experience

---

## 📱 User Experience Decisions

### Decision 14: Responsive Design Strategy

**Context**: How to handle different screen sizes and devices

**Options Considered:**
1. **Mobile-First** (Chosen)
2. **Desktop-First**
3. **Adaptive Design**
4. **Separate Mobile Site**

**Decision**: Mobile-first responsive design with breakpoints

**Rationale:**
- **Modern Standard**: Industry best practice
- **Performance**: Optimized for mobile performance
- **User Base**: Increasing mobile usage
- **SEO**: Better search engine optimization
- **Future-Proof**: Adaptable to new devices

**Trade-offs:**
- **Pros**: Modern, performant, SEO-friendly, future-proof
- **Cons**: More complex CSS, testing overhead

**Impact:** Medium - affects accessibility and user reach

---

### Decision 15: Animation Strategy

**Context**: How to use animations and transitions

**Options Considered:**
1. **No Animations** (Rejected)
2. **Heavy Animations** (Rejected)
3. **Purposeful Micro-Animations** (Chosen)
4. **Full Page Transitions**

**Decision**: Purposeful micro-animations with smooth transitions

**Rationale:**
- **User Experience**: Enhances without overwhelming
- **Performance**: Minimal performance impact
- **Accessibility**: Respects user motion preferences
- **Professional**: Subtle polish without being gimmicky
- **Feedback**: Provides clear user feedback

**Trade-offs:**
- **Pros**: Enhanced UX, minimal performance impact, professional
- **Cons**: Requires careful implementation, testing overhead

**Impact:** Low - affects user delight and perceived quality

---

## 🔒 Security Decisions

### Decision 16: Data Security Approach

**Context**: How to secure user data and API endpoints

**Options Considered:**
1. **Basic Security** (Rejected)
2. **Defense in Depth** (Chosen)
3. **Security-First Development**
4. **Compliance-Focused**

**Decision**: Defense in depth with JWT authentication and user isolation

**Rationale:**
- **User Isolation**: All data scoped to user_id
- **Authentication**: JWT tokens with proper expiration
- **Authorization**: Permission checks on all endpoints
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection**: Protected by Django ORM

**Trade-offs:**
- **Pros**: Comprehensive security, user isolation, standard practices
- **Cons**: Slightly more complex, performance overhead

**Impact:** High - affects user trust and data protection

---

### Decision 17: Password Security

**Context**: How to handle user passwords

**Options Considered:**
1. **Plain Text** (Rejected)
2. **MD5 Hashing** (Rejected)
3. **Bcrypt** (Rejected)
4. **Django Default** (Chosen)

**Decision**: Django's default password hashing (PBKDF2)

**Rationale:**
- **Security**: Industry-standard, proven security
- **Django Integration**: Built-in, well-tested
- **Performance**: Good balance of security and performance
- **Maintenance**: No custom implementation needed
- **Upgradability**: Easy to upgrade to stronger algorithms

**Trade-offs:**
- **Pros**: Secure, well-tested, integrated, maintainable
- **Cons**: Slower than simpler hashing (acceptable trade-off)

**Impact**: High - critical for user account security

---

## 🚀 Deployment Decisions

### Decision 18: Containerization Strategy

**Context**: How to package and deploy the application

**Options Considered:**
1. **Traditional Deployment** (Rejected)
2. **Docker Compose** (Chosen)
3. **Kubernetes**
4. **Serverless**

**Decision**: Docker Compose for development, ready for production

**Rationale:**
- **Consistency**: Same environment across development and production
- **Isolation**: Service isolation prevents conflicts
- **Scalability**: Easy to scale individual services
- **Portability**: Runs anywhere Docker is available
- **Simplicity**: Easy to understand and maintain

**Trade-offs:**
- **Pros**: Consistent, isolated, scalable, portable, simple
- **Cons**: Docker overhead, learning curve

**Impact:** High - affects deployment and development workflow

---

### Decision 19: Port Configuration

**Context**: How to handle port conflicts in multi-project environments

**Options Considered:**
1. **Standard Ports** (Rejected - conflicts)
2. **Custom Ports** (Chosen)
3. **Dynamic Port Allocation**
4. **Environment-Specific Ports**

**Decision**: Custom port mapping (frontend: 5174, API: 8000)

**Rationale:**
- **Conflict Avoidance**: Prevents conflicts with other projects
- **Consistency**: Predictable port assignments
- **Documentation**: Clear port assignments in documentation
- **Development**: Easy to remember and configure

**Trade-offs:**
- **Pros**: No conflicts, consistent, documented
- **Cons**: Non-standard ports, requires configuration

**Impact:** Low - affects local development setup

---

## 📊 Monitoring & Logging Decisions

### Decision 20: Logging Strategy

**Context**: How to handle application logging and monitoring

**Options Considered:**
1. **Print Statements** (Rejected)
2. **Python Logging** (Chosen)
3. **Structured Logging**
4. **External Monitoring Service**

**Decision**: Python logging with Django integration

**Rationale:**
- **Standard**: Python's built-in logging framework
- **Configurability**: Easy to adjust log levels and formats
- **Performance**: Minimal overhead when disabled
- **Integration**: Works well with Django and Docker
- **Debugging**: Adequate for development and troubleshooting

**Trade-offs:**
- **Pros**: Standard, configurable, performant, integrated
- **Cons**: Less powerful than structured logging solutions

**Impact:** Medium - affects debugging and monitoring capabilities

---

## 🔄 Future Decisions Needed

### Decision 21: Real-Time Updates (Pending)
**Context**: Need for real-time notifications and updates
**Options**: WebSockets, Server-Sent Events, Polling
**Timeline**: v2.5

### Decision 22: Mobile App Strategy (Pending)
**Context**: Mobile experience enhancement
**Options**: PWA, React Native, Flutter
**Timeline**: v3.0

### Decision 23: Advanced AI Features (Pending)
**Context**: Enhanced AI capabilities
**Options**: Fine-tuned models, RAG, Vector databases
**Timeline**: v2.5

---

## 📈 Decision Impact Summary

### High Impact Decisions
1. Technology Stack Selection
2. Database Choice
3. Background Task Processing
4. AI Service Integration
5. API Design Pattern
6. Authentication Strategy
7. Data Modeling Approach
8. AI Service Architecture
9. Data Security Approach
10. Password Security

### Medium Impact Decisions
11. Color Palette Strategy
12. Component Architecture
13. State Management
14. AI Model Selection
15. Responsive Design Strategy
16. Monitoring & Logging Strategy

### Low Impact Decisions
17. Animation Strategy
18. Port Configuration

---

## 🎯 Decision Principles

### Core Principles Guiding Decisions

1. **User Experience First**: All decisions prioritize user experience
2. **Simplicity**: Choose simpler solutions when possible
3. **Scalability**: Design for future growth
4. **Maintainability**: Code should be easy to understand and modify
5. **Security**: Never compromise on security
6. **Performance**: Optimize for speed and efficiency
7. **Distinctiveness**: Avoid generic solutions
8. **Standard Practices**: Use industry standards when appropriate

### Decision-Making Process

1. **Identify Problem**: Clearly define the problem or requirement
2. **Generate Options**: Consider multiple viable solutions
3. **Evaluate Trade-offs**: Analyze pros and cons of each option
4. **Consider Impact**: Assess short-term and long-term effects
5. **Make Decision**: Choose the best option based on principles
6. **Document**: Record decision and rationale for future reference
7. **Review**: Periodically review decisions for potential improvements

---

This decision log provides comprehensive context for all major architectural and design decisions in the Lumina project. It serves as a reference for understanding why certain choices were made and guides future decision-making processes.