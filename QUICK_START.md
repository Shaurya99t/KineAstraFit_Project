# 🚀 Quick Setup & Deployment Guide

## 5-Minute Local Setup

### Step 1: Backend
```bash
# Activate Python environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Start backend (runs on port 8000)
python app.py
```

### Step 2: Frontend (in new terminal)
```bash
# Install dependencies
npm install

# Start dev server (runs on port 5173)
npm run dev
```

### Step 3: Test
- Open browser: http://localhost:5173
- Sign up with any email
- Backend auto-creates SQLite database

---

## Deployment to Production (10 minutes)

### Choose One Platform:

#### A. Render.com (Recommended for FastAPI)
1. Connect GitHub repo to Render
2. Create Web Service (auto-reads `render.yaml`)
3. Add PostgreSQL database
4. Set environment variables (GROQ_API_KEY, SECRET_KEY)
5. Deploy!

#### B. Railway (Simple & Fast)
1. Connect GitHub repo to Railway
2. Add PostgreSQL service
3. Railway auto-detects `railway.toml`
4. Deploy!

#### C. Vercel (for Frontend)
1. Connect GitHub to Vercel
2. Select framework: Vite
3. Add env var: `VITE_API_URL=https://your-backend-url`
4. Deploy!

---

## Environment Variables

### Backend (.env files)
- See `.env.example` for template
- `.env.development` - local development
- `.env.production` - production settings

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000  # local development
VITE_API_URL=https://api.yourdomain.com  # production
```

---

## API Health Check

```bash
# Backend running check
curl http://localhost:8000/health
# Response: {"status":"healthy","service":"AI Fitness Backend","version":"4.0.0"}

# API Docs
curl http://localhost:8000/docs
```

---

## Production Checklist

- [ ] `.env.production` configured with real values
- [ ] DATABASE_URL points to PostgreSQL
- [ ] GROQ_API_KEY added to environment
- [ ] SECRET_KEY is a new random string
- [ ] ALLOWED_ORIGINS set to your domain
- [ ] Frontend build passes: `npm run build`
- [ ] Backend starts without errors: `python app.py`
- [ ] All routes tested with curl/Postman

---

## File Changes Summary

✅ **Fixed Files:**
- `app.py` - Updated PORT handling for Render/Railway
- `requirements.txt` - Cleaned up duplicates
- `vite.config.js` - Added production optimization
- `package.json` - Added build script

✅ **New Files:**
- `.env.development` - Dev environment variables
- `.env.production` - Prod environment variables
- `.env.example` - Template for setup
- `.env.local` - Frontend local development
- `Procfile` - Heroku deployment
- `render.yaml` - Render.com deployment
- `railway.toml` - Railway.app deployment
- `vercel.json` - Vercel frontend config
- `DEPLOYMENT.md` - Full deployment guide

---

## Common Issues & Fixes

**Issue**: Port already in use
```bash
# Find process using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>
```

**Issue**: CORS errors in browser
→ Ensure backend `.env` has correct `ENV=dev` or `ALLOWED_ORIGINS`

**Issue**: npm install fails
```bash
rm -rf node_modules package-lock.json
npm install
```

**Issue**: pip install fails
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Support

For issues, check:
1. Backend logs: `python app.py` console
2. Frontend logs: Browser console (F12)
3. DEPLOYMENT.md for detailed guide
4. .env files are properly configured

---

**Everything is production-ready! 🎉**
