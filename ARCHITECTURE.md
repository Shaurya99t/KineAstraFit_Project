# 🏗️ Architecture & System Design

## Production Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                         │
│                      https://app.yourdomain.com                   │
│                                                                    │
│  React + Vite                                                    │
│  ├─ Components (10+)                                            │
│  ├─ Pages (6)                                           │
│  │  ├─ AuthPage (Login/Signup)                                │
│  │  ├─ DashboardPage (Overview)                              │
│  │  ├─ ProfilePage (Settings)                               │
│  │  ├─ ChatPage (AI Coach)                                  │
│  │  ├─ WorkoutLoggerPage                                    │
│  │  └─ NutritionPage                                        │
│  ├─ Services                                                 │
│  │  └─ api.js (Axios HTTP client)                          │
│  └─ Utils                                                     │
│     └─ errorHandler.js                                      │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ HTTP/REST API Calls
           │ VITE_API_URL=https://api.yourdomain.com
           │
┌──────────▼───────────────────────────────────────────────────────┐
│                    BACKEND API SERVER (Render/Railway)           │
│                     https://api.yourdomain.com                    │
│                                                                    │
│  FastAPI Application (app.py)                                   │
│  ├─ 7 Route Modules (18 endpoints)                             │
│  │  ├─ auth_routes.py (signup, login)                         │
│  │  ├─ profile_routes.py (profile CRUD)                       │
│  │  ├─ workout_routes.py (workout logging, progress)         │
│  │  ├─ nutrition_routes.py (meal planning, logging)          │
│  │  ├─ chat_routes.py (AI chat, history)                     │
│  │  ├─ history_routes.py (historical snapshots)              │
│  │  └─ health_routes.py (health checks)                      │
│  │                                                             │
│  ├─ Authentication                                            │
│  │  └─ auth.py (JWT validation, password hashing)           │
│  │                                                             │
│  ├─ Business Logic                                           │
│  │  └─ services/                                             │
│  │     ├─ ai_service.py (context building)                  │
│  │     ├─ profile_service.py (profile logic)                │
│  │     ├─ workout_service.py (analytics)                    │
│  │     ├─ nutrition_service.py (meal plans)                │
│  │     ├─ memory_service.py (user memory)                   │
│  │     └─ rag_service.py (knowledge retrieval)             │
│  │                                                             │
│  ├─ Data Validation                                          │
│  │  └─ schemas.py (15+ Pydantic models)                      │
│  │                                                             │
│  └─ Database ORM                                              │
│     └─ database.py (SQLAlchemy setup)                        │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ SQL Queries
           │
┌──────────▼───────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                          │
│                     (Render/Railway Managed)                      │
│                                                                    │
│  Tables (6):                                                     │
│  ├─ users (id, email, password_hash)                           │
│  ├─ user_profiles (name, age, weight, goals, etc.)           │
│  ├─ workout_logs (exercise, sets, reps, date)                │
│  ├─ nutrition_logs (food, calories, macros, date)            │
│  ├─ chat_history (user_input, ai_response, timestamp)        │
│  └─ user_history (weight, performance, metrics)              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│                                                                    │
│  Groq API                                                        │
│  ├─ AI Chat Responses                                          │
│  ├─ Context Understanding                                      │
│  └─ Model: Mixtral/LLaMA                                       │
│                                                                    │
│  FAISS (Local)                                                  │
│  ├─ Embedding Search                                           │
│  ├─ Fitness Knowledge Retrieval                               │
│  └─ RAG Implementation                                         │
│                                                                    │
│  Sentence Transformers (Local)                                 │
│  └─ Text Embeddings                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Deployment Platforms

### Render.com (Backend)
```
┌─────────────────────────────────┐
│     GitHub Repository           │
│  (Push triggers auto-deploy)    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Render Web Service            │
│  (Python 3.11 + Uvicorn)       │
│  - Auto reads render.yaml       │
│  - Auto scales workers          │
│  - Includes SSL/HTTPS           │
└────────────┬────────────────────┘
             │
             ├─────────────────┐
             │                 │
             ▼                 ▼
┌──────────────────┐   ┌──────────────────┐
│   Web Service    │   │   PostgreSQL DB  │
│  :10000          │   │  (Managed)       │
│  4 workers       │   │  Automatic       │
│  Auto-scaling    │   │  Backups         │
└──────────────────┘   └──────────────────┘
```

### Vercel (Frontend)
```
┌─────────────────────────────────┐
│     GitHub Repository           │
│  (Push triggers auto-deploy)    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Vercel CDN                    │
│  (Edge optimization)            │
│  - Global distribution          │
│  - Auto HTTPS                   │
│  - Environment variables        │
└─────────────────────────────────┘
```

---

## Data Flow

### 1. Authentication Flow
```
User Input (email, password)
           │
           ▼
    [SignUp Form]
           │
           ▼
    POST /signup
    [Request to Backend]
           │
           ▼
    [Backend: auth.py]
    - Check if user exists
    - Hash password with bcrypt
    - Create user in DB
           │
           ▼
    [UserResponse]
    - id, email
           │
           ▼
    [Frontend: Store in localStorage]
    
--- OR ---

    [Login Form]
           │
           ▼
    POST /login
    [Request to Backend]
           │
           ▼
    [Backend: auth.py]
    - Find user by email
    - Verify password
    - Create JWT token
           │
           ▼
    [Token Response]
    - access_token
    - token_type: "bearer"
           │
           ▼
    [Frontend: Store in localStorage]
    [Add to all future requests: Authorization: Bearer <token>]
```

### 2. Profile Creation Flow
```
User completes profile form
           │
           ▼
    PUT /profile
    [Request with JWT]
           │
           ▼
    [Backend: get_current_user dependency]
    - Extract user_id from JWT
    - Validate request data with Pydantic
    - Upsert profile in database
           │
           ▼
    [ProfileResponse]
    - All profile fields
    - Memory summary
    - Stats (workouts, etc)
           │
           ▼
    [Frontend: Update UI]
    [Redirect to dashboard]
```

### 3. AI Chat Flow
```
User sends chat message
           │
           ▼
    POST /chat
    [ChatRequest: user_input]
           │
           ▼
    [Backend: chat_routes.py]
    - Get user's profile
    - Get recent workouts (30)
    - Get chat history (5)
    - Get weight history
           │
           ▼
    [ai_service.py: build_chat_context]
    - Combine all context
    - Format as memory summary
           │
           ▼
    [Build prompt with RAG]
    - Retrieve relevant knowledge from FAISS
    - Add fitness knowledge base
    - Format final prompt
           │
           ▼
    [groq_client.py: get_ai_response]
    - Call Groq API (Mixtral model)
    - Stream response
           │
           ▼
    [Save to chat history]
    - Store in database
    - Update memory summary
           │
           ▼
    [ChatResponse]
    - response: AI generated text
           │
           ▼
    [Frontend: Display in chat]
    [Show to user]
```

---

## Request/Response Flow

### Example: Get Workout Progress

```
Frontend Request:
┌─────────────────────────────────────┐
│ GET /workout-progress               │
│ Authorization: Bearer <JWT_TOKEN>   │
│ Content-Type: application/json      │
└─────────────────────────────────────┘

Backend Processing:
┌─────────────────────────────────────┐
│ [workout_routes.py]                 │
│ 1. get_current_user()               │
│    - Validate JWT                   │
│    - Extract user_id                │
│ 2. get_profile(user_id)             │
│    - Query UserProfile from DB      │
│ 3. Get last 100 workout logs        │
│    - Query WorkoutLog from DB       │
│ 4. Calculate metrics:               │
│    - Weight progress (chart)        │
│    - Streak days                    │
│    - Completion rate                │
│    - Fatigue level                  │
│    - Daily/weekly plans             │
│ 5. Format response                  │
└─────────────────────────────────────┘

Backend Response:
┌──────────────────────────────────┐
│ 200 OK                           │
│ {                                │
│   "fatigue": 45,                 │
│   "completion_rate": 87,         │
│   "streak_days": 5,              │
│   "completed_workouts": 42,      │
│   "skipped_workouts": 8,         │
│   "daily_plan": {...},           │
│   "weekly_plan": [...],          │
│   "weight_progress": [...],      │
│   "weekly_consistency": [...],   │
│   "calories_progress": [...]     │
│ }                                │
└──────────────────────────────────┘

Frontend Rendering:
┌──────────────────────────────┐
│ [DashboardPage.jsx]          │
│ 1. Parse response            │
│ 2. Update state              │
│ 3. Render charts with Recharts
│ 4. Display metrics          │
│ 5. Show progress cards      │
└──────────────────────────────┘
```

---

## Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    name VARCHAR(100),
    age INTEGER,
    weight INTEGER,
    height INTEGER,
    goal VARCHAR(100),
    diet VARCHAR(100),
    activity_level VARCHAR(100),
    fitness_level VARCHAR(100),
    region VARCHAR(20),
    target_weight INTEGER,
    workout_preference VARCHAR(100),
    medical_notes TEXT,
    completed_workouts INTEGER DEFAULT 0,
    skipped_workouts INTEGER DEFAULT 0,
    memory_summary TEXT,
    last_active_date DATE
);

-- Workout Logs Table
CREATE TABLE workout_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    exercise_name VARCHAR(120),
    sets INTEGER,
    reps INTEGER,
    weight INTEGER,
    intensity INTEGER,
    date DATE
);

-- Nutrition Logs Table
CREATE TABLE nutrition_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    food VARCHAR(200),
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    date DATE
);

-- Chat History Table
CREATE TABLE chat_history (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    user_input TEXT,
    ai_response TEXT,
    timestamp DATETIME DEFAULT NOW()
);

-- User History Table
CREATE TABLE user_history (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    log_date DATE,
    weight INTEGER,
    previous_goal VARCHAR,
    weekly_performance INTEGER,
    streak_days INTEGER,
    calories_intake INTEGER
);
```

---

## Environment Variables Mapping

```
DEVELOPMENT ENVIRONMENT (.env.development)
├─ ENV = dev
├─ PORT = 8000
├─ DATABASE_URL = sqlite:///./fitness_app.db
├─ GROQ_API_KEY = [your key]
├─ SECRET_KEY = [dev key]
├─ ALLOWED_ORIGINS = http://localhost:5173,http://127.0.0.1:5173
└─ Used for: Local development with auto-reload

PRODUCTION ENVIRONMENT (.env.production)
├─ ENV = production
├─ PORT = 10000 (Render/Railway provide $PORT)
├─ DATABASE_URL = postgresql://[auto-provided by platform]
├─ GROQ_API_KEY = [production key]
├─ SECRET_KEY = [production key - new random value]
├─ ALLOWED_ORIGINS = https://yourdomain.com
└─ Used for: Live deployment

FRONTEND DEVELOPMENT (.env.local)
├─ VITE_API_URL = http://localhost:8000
└─ Used for: Local React dev testing

FRONTEND PRODUCTION (Vercel Dashboard)
├─ VITE_API_URL = https://your-backend-domain.com
└─ Used for: Production React deployment
```

---

## Deployment Comparison

| Aspect | Render | Railway | Vercel | Heroku |
|--------|--------|---------|--------|--------|
| Backend Support | ✅ Yes | ✅ Yes | ❌ No | ⚠️ Paid |
| Frontend Support | Via Vercel | Via Vercel | ✅ Yes | Via Vercel |
| Database | PostgreSQL | PostgreSQL | ❌ No | Add-on |
| SSL/HTTPS | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Yes |
| Auto-Deploy | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Free Tier | ✅ $0 | ✅ $5/mo | ✅ $0 | ❌ Paid |
| Cold Start | ~30s | ~20s | ~100ms | ~60s |
| Build Time | ~5min | ~3min | ~2min | ~3min |
| Setup Time | ~10min | ~8min | ~5min | ~10min |

**Recommendation**: Render + Vercel combo is optimal

---

## Performance Optimizations

```
BACKEND (FastAPI)
├─ Async/await for non-blocking I/O
├─ Database connection pooling
├─ Multi-worker Uvicorn (4 workers)
├─ Query optimization with SQLAlchemy
└─ Response compression enabled

FRONTEND (React + Vite)
├─ Code splitting (vendor + UI chunks)
├─ Tree shaking (unused code removal)
├─ Minification with Terser
├─ Lazy loading for routes
├─ Production source maps disabled
└─ Asset optimization
```

---

## Security Layers

```
LAYER 1: Transport
├─ HTTPS/SSL (auto-provided by platforms)
├─ Certificate auto-renewal
└─ Secure headers

LAYER 2: Authentication
├─ JWT tokens (signed)
├─ 30-minute expiration
├─ Bcrypt password hashing
└─ Secure token storage (localStorage)

LAYER 3: Authorization
├─ Protected routes require JWT
├─ User isolation (can only access own data)
├─ Database constraints
└─ Input validation with Pydantic

LAYER 4: Data Protection
├─ Environment-based configuration
├─ No hardcoded secrets
├─ PostgreSQL encryption at rest
├─ Database backup strategy
└─ CORS restrictions to trusted origins
```

---

**Architecture is production-ready and scalable!** ✅
