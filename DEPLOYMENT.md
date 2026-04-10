# 🚀 AI Fitness Platform - Production Deployment Guide

## Project Overview

**AI Fitness Platform** is a full-stack fitness management application with:
- **Backend**: FastAPI (Python) with JWT authentication, PostgreSQL database, Groq AI integration, RAG system
- **Frontend**: React + Vite with Tailwind CSS, Framer Motion animations, Recharts for analytics
- **Features**: User authentication, profile management, workout logging, nutrition tracking, AI chat coach with memory

---

## 🏗️ Project Structure

```
.
├── BACKEND (FastAPI)
│   ├── app.py                    # Main FastAPI application
│   ├── auth.py                   # JWT authentication logic
│   ├── database.py               # SQLAlchemy configuration
│   ├── groq_client.py           # AI integration via Groq
│   ├── requirements.txt          # Python dependencies
│   ├── routes/                   # API endpoint handlers
│   │   ├── auth_routes.py        # Login, signup
│   │   ├── profile_routes.py     # User profile management
│   │   ├── chat_routes.py        # AI chat & memory
│   │   ├── workout_routes.py     # Workout logging & progress
│   │   ├── nutrition_routes.py   # Nutrition planning
│   │   ├── history_routes.py     # Historical data
│   │   └── health_routes.py      # Health check endpoint
│   ├── services/                 # Business logic
│   │   ├── ai_service.py         # AI context building
│   │   ├── profile_service.py    # Profile logic
│   │   ├── workout_service.py    # Workout analytics
│   │   ├── nutrition_service.py  # Nutrition plans
│   │   ├── memory_service.py     # User memory management
│   │   └── rag_service.py        # RAG implementation
│   ├── models/                   # SQLAlchemy models
│   ├── .env.development          # Dev environment variables
│   ├── .env.production           # Prod environment variables
│   ├── Procfile                  # Heroku deployment config
│   ├── render.yaml               # Render.com deployment config
│   └── railway.toml              # Railway.app deployment config
│
├── FRONTEND (React + Vite)
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Root component
│   │   ├── pages/                # Page components
│   │   │   ├── AuthPage.jsx      # Login/signup
│   │   │   ├── DashboardPage.jsx # Main dashboard
│   │   │   ├── ProfilePage.jsx   # Profile setup
│   │   │   ├── ChatPage.jsx      # AI coach chat
│   │   │   ├── WorkoutLoggerPage.jsx
│   │   │   └── NutritionPage.jsx
│   │   ├── components/           # Reusable components
│   │   ├── services/
│   │   │   └── api.js            # Axios API configuration
│   │   └── utils/
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # NPM dependencies
│   ├── .env.local                # Frontend dev env
│   ├── vercel.json               # Vercel deployment config
│   └── tailwind.config.js        # Tailwind configuration
│
├── .env.example                  # Example environment variables
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

**Development** (`.env.development`):
```env
ENV=dev
PORT=8000
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./fitness_app.db
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Production** (`.env.production`):
```env
ENV=production
PORT=10000
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_production_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://user:password@host:5432/dbname
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Environment Variables

**Development** (`.env.local`):
```env
VITE_API_URL=http://localhost:8000
```

**Production** (set in Vercel/Netlify dashboard):
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL/SQLite
- Git

### 1. Clone and Setup Backend

```bash
# Navigate to project root
cd path/to/fitness-project

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy example env file
cp .env.example .env.development

# Start backend (port 8000)
python app.py
```

The backend will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Setup Frontend

```bash
# In a new terminal, navigate to project root
cd path/to/fitness-project

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start dev server (port 5173)
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 3. Test the Application

```bash
# Test backend health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"AI Fitness Backend","version":"4.0.0"}

# Test signup (replace with real email)
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## 🚀 Deployment

### Option 1: Deploy to Render.com (Recommended)

#### Backend Deployment

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Production ready fitness platform"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render.com](https://render.com)
   - Sign in with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Fill in settings:
     - **Name**: ai-fitness-backend
     - **Runtime**: Python
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT --workers 4`
   - Under "Environment Variables", add:
     - `ENV`: production
     - `GROQ_API_KEY`: your_groq_api_key
     - `SECRET_KEY`: generate_a_new_random_key
     - `DATABASE_URL`: (Render will auto-fill with PostgreSQL)
     - `ALLOWED_ORIGINS`: https://your-frontend-domain.com

3. **Create PostgreSQL Database**
   - In Render dashboard: "New +" → "PostgreSQL"
   - Name: fitness-postgres
   - Copy the connection string to backend env vars

4. **Deploy**
   - Click "Create Web Service"
   - Render will auto-deploy on push

**Backend URL**: `https://ai-fitness-backend.onrender.com`

#### Frontend Deployment

1. **Deploy to Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository
   - Fill in settings:
     - **Framework**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: dist
   - Add Environment Variables:
     - `VITE_API_URL`: https://ai-fitness-backend.onrender.com
   - Click "Deploy"

**Frontend URL**: `https://ai-fitness.vercel.app`

---

### Option 2: Deploy to Railway.app

#### Backend

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add plugins:
   - PostgreSQL (for database)
5. Set Environment Variables:
   - `ENV`: production
   - `GROQ_API_KEY`: your_groq_api_key
   - `SECRET_KEY`: generate_a_new_random_key
6. Railway auto-detects `railway.toml` and deploys

#### Frontend

Same as Vercel steps above

---

### Option 3: Deploy to Heroku (Deprecated - Use Render/Railway)

**Note**: Heroku free tier discontinued. Use Render or Railway instead.

If you still want to use Heroku:
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create ai-fitness-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set ENV=production
heroku config:set GROQ_API_KEY=your_groq_api_key
heroku config:set SECRET_KEY=your_production_secret_key
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com

# Deploy
git push heroku main
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Generate a new `SECRET_KEY` (use `python -c "import secrets; print(secrets.token_hex(32))"`)
- [ ] Change database credentials in `.env.production`
- [ ] Ensure `GROQ_API_KEY` is securely stored (never commit to Git)
- [ ] Set specific `ALLOWED_ORIGINS` (never use `*` in production)
- [ ] Enable HTTPS for frontend and backend
- [ ] Set up database backups
- [ ] Configure rate limiting on API endpoints
- [ ] Monitor error logs and performance
- [ ] Use environment-specific configurations

---

## 📝 API Endpoints Reference

All endpoints require JWT authentication (except signup/login).

### Authentication
- `POST /signup` - Create account
- `POST /login` - Login and get token

### Profile
- `GET /profile` - Get user profile
- `GET /profile/me` - Get current user profile
- `PUT /profile` - Update profile
- `POST /profile` - Create profile

### Workouts
- `POST /workout-log` - Log a workout
- `GET /workout-log` - Get all workouts
- `GET /workout-progress` - Get progress analytics

### Nutrition
- `GET /nutrition-plan` - Get personalized nutrition plan
- `POST /nutrition` - Search food database
- `POST /nutrition-log` - Log meal
- `GET /nutrition-log` - Get meal logs

### Chat & Memory
- `POST /chat` - Send message to AI coach
- `GET /chat-history` - Get chat history
- `POST /chat-history` - Save chat entry
- `DELETE /chat-history` - Clear chat history

### History
- `GET /history` - Get historical snapshots
- `POST /history` - Create history snapshot

### Health
- `GET /health` - Health status
- `GET /` - Root endpoint

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Fix**: Activate venv and run `pip install -r requirements.txt`

**Issue**: `404 Not Found` on /profile
- **Fix**: 
  - Ensure JWT token is valid in Authorization header
  - Check CORS middleware is properly configured
  - Verify profile endpoint is registered in app.py

**Issue**: `CORS error` in browser console
- **Fix**: 
  - Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
  - Ensure `ENV=dev` for development (allows all origins)
  - Restart backend server

**Issue**: `Database locked` error
- **Fix**: 
  - If using SQLite, close all connections to database
  - For production, switch to PostgreSQL

### Frontend Issues

**Issue**: `VITE_API_URL` not loading
- **Fix**:
  - Ensure `.env.local` exists with `VITE_API_URL=http://localhost:8000`
  - Restart dev server: `npm run dev`
  - Check browser console for correct URL

**Issue**: `Build fails` - `npm run build`
- **Fix**:
  - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
  - Check for syntax errors in JSX files
  - Ensure all imports are correct

---

## 📊 Monitoring & Logs

### Backend Logs
- Render: Dashboard → Logs tab
- Railway: Dashboard → Logs tab
- Local: Check terminal where `python app.py` runs

### Frontend Logs
- Vercel: Builds → View logs
- Browser DevTools: F12 → Console tab

---

## 🔄 Deployment Workflow

1. **Local Testing**
   ```bash
   # Backend running on :8000
   python app.py
   
   # Frontend running on :5173
   npm run dev
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "Feature: Description"
   git push origin main
   ```

4. **Monitor Deployment**
   - Render/Railway: Dashboard auto-deploys
   - Vercel: Auto-deploys on push
   - Check logs for errors

5. **Test Production**
   - Visit frontend URL
   - Test login/signup
   - Test API endpoints
   - Check browser DevTools console

---

## 📚 Additional Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## 🎯 Features Implemented

✅ JWT Authentication with secure token handling
✅ Role-based profile management
✅ Workout logging with analytics
✅ Nutrition planning and tracking
✅ AI-powered chat coach with memory system
✅ RAG-based fitness knowledge integration
✅ CORS support for multiple origins
✅ Production deployment ready
✅ Environment-based configuration
✅ PostgreSQL support for production
✅ Error handling and logging
✅ API documentation with Swagger/OpenAPI

---

## 📄 License

This project is ready for production deployment. All sensitive information must be properly secured.

---

**Last Updated**: April 2026  
**Status**: Production Ready ✅
