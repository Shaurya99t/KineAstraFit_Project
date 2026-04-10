# 🚀 LOCAL SETUP & DEPLOYMENT GUIDE

## PART 1: LOCAL DEVELOPMENT SETUP (5 Minutes)

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Step 1: Backend Setup

#### 1a. Install Python Dependencies
```bash
cd "c:\Users\shaur\Desktop\New folder\New folder"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 1b. Verify .env is Configured
Check that `.env` contains:
```
ENV=dev
PORT=8000
GROQ_API_KEY=your_api_key_here
SECRET_KEY=9f7f2c8d9b304c5c8e6b2f3a5d1e7c9b6a4f8d2c1e3b5a7d9c6f2b4e8a1d3c5
DATABASE_URL=sqlite:///./fitness_app.db
```

#### 1c. Start Backend
```bash
python app.py
```

**Expected Output**:
```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Backend is running at**: `http://localhost:8000`  
**API Docs**: `http://localhost:8000/docs`  
**Health Check**: `http://localhost:8000/health`

---

### Step 2: Frontend Setup

#### 2a. Install Frontend Dependencies (in a NEW terminal)
```bash
cd "c:\Users\shaur\Desktop\New folder\New folder"

# Install dependencies
npm install
```

#### 2b. Verify .env.local
Check that `.env.local` contains:
```
VITE_API_URL=http://localhost:8000
```

#### 2c. Start Frontend Dev Server
```bash
npm run dev
```

**Expected Output**:
```
  VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  press h to show help
```

**Frontend is running at**: `http://localhost:5173`

---

### Step 3: Test the Application

#### 3a. Backend Health Check
```bash
curl http://localhost:8000/health

# Expected Response:
# {"status":"healthy","service":"AI Fitness Backend","version":"4.0.0"}
```

#### 3b. Frontend in Browser
1. Open: `http://localhost:5173`
2. Check browser console (F12) for:
   - No CORS errors
   - Message: "🔌 API URL configured: http://localhost:8000"

#### 3c. Test Auth Flow
1. Click "Sign Up"
2. Create account with test email: `test@example.com`
3. Should see success message
4. Login with same credentials
5. Should redirect to dashboard

#### 3d. Test API Endpoints
```bash
# Get token first
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response includes access_token

# Use token to call protected endpoint
curl http://localhost:8000/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## PART 2: PRODUCTION DEPLOYMENT

### BACKEND DEPLOYMENT (Render.com - Recommended)

#### Step 1: Prepare Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Production ready deployment"
git push origin main
```

#### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### Step 3: Create Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Fill in configuration:
   - **Name**: ai-fitness-backend
   - **Environment**: Python 3.11
   - **Branch**: main
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Step 4: Add Environment Variables
Click "Environment" and add:
```
ENV=production
PORT=8000
GROQ_API_KEY=your_api_key_here
SECRET_KEY=9f7f2c8d9b304c5c8e6b2f3a5d1e7c9b6a4f8d2c1e3b5a7d9c6f2b4e8a1d3c5
DATABASE_URL=(skip for now - use SQLite or add PostgreSQL below)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### Step 5: (Optional) Add PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Create database
3. Copy DATABASE_URL from PostgreSQL service
4. Add to Web Service environment variables
5. Wait for database to initialize

#### Step 6: Deploy
1. Click "Create Web Service"
2. Watch build logs
3. Wait for "Your service is live at: https://ai-fitness-backend.onrender.com"
4. **Copy this URL** - you'll need it for frontend deployment

**Backend is now deployed at**: `https://ai-fitness-backend.onrender.com`

---

### FRONTEND DEPLOYMENT (Vercel)

#### Step 1: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. Framework: "Vite"
6. Build Command: `npm run build`
7. Output Directory: `dist`

#### Step 2: Add Environment Variables
Click "Environment Variables" and add:
```
VITE_API_URL = https://ai-fitness-backend.onrender.com
```
(Replace with your actual backend URL from Step 5 above)

#### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Get your frontend URL: `https://your-app.vercel.app`

**Frontend is now deployed at**: `https://your-app.vercel.app`

---

#### Step 4: Update Backend CORS
Go back to Render dashboard:
1. Select "ai-fitness-backend" service
2. Click "Environment"
3. Update ALLOWED_ORIGINS:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
4. Click "Save" - service will auto-redeploy
5. Wait for green checkmark

---

### ALTERNATIVE BACKEND: Railway.app

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

#### Step 2: Create Project
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Select your repository

#### Step 3: Add Environment Variables
Click "Variables" and add same env vars as Render (above)

#### Step 4: Auto-Deploy
Railway will automatically:
- Read your requirements.txt
- Install dependencies
- Start your app

**Backend is now deployed at**: `https://your-app.railway.app`

---

### ALTERNATIVE FRONTEND: Netlify

#### Step 1: Go to Netlify
1. https://netlify.com
2. Sign in with GitHub

#### Step 2: Create Site
1. Click "New site from Git"
2. Select repository
3. Build command: `npm run build`
4. Publish directory: `dist`

#### Step 3: Add Environment Variable
During "Deploy Settings":
```
VITE_API_URL=https://your-backend-url.com
```

#### Step 4: Deploy
Click "Deploy" and wait for completion

---

## VERIFICATION CHECKLIST

### After Local Setup
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check: curl http://localhost:8000/health works
- [ ] No browser console errors
- [ ] [API URL logs in console](shows correct URL)
- [ ] Sign up works
- [ ] Login works
- [ ] Profile loads
- [ ] Dashboard displays

### After Production Deployment
- [ ] Backend health check: `curl https://your-backend.com/health`
- [ ] Frontend loads at `https://your-frontend.com`
- [ ] No CORS errors in browser console
- [ ] Sign up works
- [ ] Login works
- [ ] API calls succeed (not 404)
- [ ] Database initialized successfully

---

## TROUBLESHOOTING

### Backend Won't Start
**Error**: `ModuleNotFoundError`
```bash
# Solution:
pip install -r requirements.txt
```

**Error**: `GROQ_API_KEY not found`
```bash
# Solution: Add to .env:
GROQ_API_KEY=your_key_here
```

**Error**: `DATABASE_URL not found`
```bash
# Solution: Add to .env:
DATABASE_URL=sqlite:///./fitness_app.db
```

### Frontend Build Fails
**Error**: `terser not found`
```bash
# Solution (already done):
npm install terser --save-dev
```

**Error**: `Module not found`
```bash
# Solution:
rm -rf node_modules
npm install
npm run build
```

### Frontend Can't Call Backend
**Error**: CORS error in console
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
1. Check VITE_API_URL is correct
2. Check backend has CORS enabled
3. For prod: add frontend URL to ALLOWED_ORIGINS in backend

**Error**: 404 on API endpoints
```
GET /profile 404
```

**Solution**:
1. Check API endpoint exists in backend
2. Check JWT token is valid
3. Check VITE_API_URL includes protocol (http://)

---

## NEXT STEPS

### Day 1: Local Testing
- [ ] Set up local backend
- [ ] Set up local frontend
- [ ] Test login/signup
- [ ] Test profile creation
- [ ] Test workout logging
- [ ] Test nutrition tracking
- [ ] Test AI chat

### Day 2: Production Deployment
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Add database (optional)
- [ ] Test all endpoints in production
- [ ] Set up custom domain (optional)

### Day 3: Monitoring & Optimization
- [ ] Set up error logging
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Enable SSL/HTTPS
- [ ] Scale if needed

---

**You're ready to go! 🚀**
