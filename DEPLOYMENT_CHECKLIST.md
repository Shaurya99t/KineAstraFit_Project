# 🚀 DEPLOYMENT CHECKLIST & STEPS

## PRE-DEPLOYMENT VERIFICATION

### Step 1: Local Testing Complete ✅
- [ ] Backend starts without errors: `python app.py`
- [ ] Frontend builds without errors: `npm run build`
- [ ] All API endpoints respond correctly
- [ ] Login/signup flow works
- [ ] Profile creation works
- [ ] Chat functionality works
- [ ] Browser console has no errors
- [ ] No CORS errors in browser

### Step 2: Code is Committed ✅
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```
- [ ] All changes committed to GitHub
- [ ] Repository is public (for deployment platforms to access)
- [ ] No uncommitted changes remaining

### Step 3: Environment Variables Ready ✅

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
# Copy the output - you'll need this
```

**Get GROQ_API_KEY:**
- [ ] Go to https://console.groq.com/keys
- [ ] Copy your API key
- [ ] Keep it safe (don't share publicly)

**Prepare PostgreSQL Connection String:**
- [ ] Note: Render/Railway auto-provide this when you set up the database
- [ ] Format: `postgresql://user:password@host:5432/database_name`

---

## DEPLOYMENT OPTION A: RENDER.COM (Recommended)

### Backend Deployment (Step 1-5)

**Step 1: Create Render Account**
- [ ] Go to https://render.com
- [ ] Sign up (use GitHub for easy setup)
- [ ] Verify email

**Step 2: Connect GitHub**
- [ ] In Render dashboard, click "New +"
- [ ] Select "Web Service"
- [ ] Click "Connect account" → GitHub
- [ ] Authorize Render
- [ ] Select your repository

**Step 3: Configure Web Service**
- [ ] **Name**: `ai-fitness-backend` (or your choice)
- [ ] **Runtime**: Python 3.11
- [ ] **Region**: Choose closest to you
- [ ] **Branch**: main
- [ ] **Build Command**: Leave default (Render auto-reads render.yaml)
- [ ] **Start Command**: Leave default (Render auto-reads render.yaml)

**Step 4: Add Environment Variables**
Click "Environment" tab:
```
ENV = production
GROQ_API_KEY = [paste from console.groq.com]
SECRET_KEY = [paste the generated secret key]
ALLOWED_ORIGINS = https://your-frontend-domain.com
```
- [ ] All 4 variables added
- [ ] No typos in variable names

**Step 5: Create PostgreSQL Database**
- [ ] Click "New +" in Render dashboard
- [ ] Select "PostgreSQL"
- [ ] **Name**: `fitness-postgres`
- [ ] **Database**: fitness_app
- [ ] **User**: fitness_user
- [ ] **Region**: Same as backend
- [ ] **Pricing Plan**: Free
- [ ] **Create Database**
- [ ] Copy the Internal Database URL
- [ ] Go back to Web Service
- [ ] Add environment variable:
  ```
  DATABASE_URL = [paste the internal URL]
  ```

**Step 6: Deploy Backend**
- [ ] Click "Create Web Service"
- [ ] Render will start building (watch logs)
- [ ] Wait for green checkmark
- [ ] **Copy the backend URL**: https://ai-fitness-backend.onrender.com

✅ **Backend is now deployed!**

---

### Frontend Deployment (Step 6)

**Step 1: Create Vercel Account**
- [ ] Go to https://vercel.com
- [ ] Sign up (use GitHub for easy setup)
- [ ] Authorize GitHub access

**Step 2: Import Repository**
- [ ] Click "New Project"
- [ ] Select your repository
- [ ] Import

**Step 3: Configure Project**
- [ ] **Framework**: Vite
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: dist
- [ ] Leave other settings as default

**Step 4: Add Environment Variables**
```
VITE_API_URL = https://ai-fitness-backend.onrender.com
```
- [ ] Add the variable
- [ ] Use the backend URL from Step 6 above
- [ ] Click "Deploy"

**Step 5: Watch Deployment**
- [ ] Vercel will build and deploy
- [ ] Wait for green checkmark
- [ ] **Copy the frontend URL**: https://your-app.vercel.app

✅ **Frontend is now deployed!**

---

## DEPLOYMENT OPTION B: RAILWAY.APP

### Backend Deployment (Step 1-4)

**Step 1: Create Railway Account**
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub

**Step 2: Create Project**
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub"
- [ ] Authorize and select your repository
- [ ] Click "Deploy"

**Step 3: Add PostgreSQL**
- [ ] In project dashboard, click "Add Service"
- [ ] Select "Database"
- [ ] Click "PostgreSQL"
- [ ] Create it

**Step 4: Configure Environment Variables**
- [ ] In Web Service settings, click "Variables"
- [ ] Add:
  ```
  ENV = production
  GROQ_API_KEY = [your key]
  SECRET_KEY = [your generated key]
  ALLOWED_ORIGINS = https://your-frontend.vercel.app
  ```
- [ ] Railway auto-connects DATABASE_URL from PostgreSQL service

**Step 5: Deploy**
- [ ] Railway auto-detects `railway.toml`
- [ ] Automatically deploys
- [ ] Watch the "Logs" tab
- [ ] **Copy the backend public URL**

✅ **Backend is deployed!**

### Frontend Deployment
- Same as Render Option A, Step "Frontend Deployment"
- [ ] Deploy to Vercel
- [ ] Use Railway backend URL for VITE_API_URL

✅ **Frontend is deployed!**

---

## POST-DEPLOYMENT VERIFICATION

### Step 1: Test Backend Health
```bash
curl https://your-backend-url.com/health
```
- [ ] Should return: `{"status":"healthy","service":"AI Fitness Backend","version":"4.0.0"}`

### Step 2: Test Frontend
- [ ] Open https://your-frontend-url.com in browser
- [ ] Should see login page
- [ ] Check browser console (F12) - should have no CORS errors
- [ ] Look for: "🔌 API URL configured: https://your-backend-url.com"

### Step 3: Test Signup Flow
- [ ] Click "Sign up"
- [ ] Create account with test email
- [ ] Should succeed
- [ ] Check backend logs - should see signup request
- [ ] Login with the account

### Step 4: Test Core Features
- [ ] Profile page - create/update profile
- [ ] Dashboard - view empty state
- [ ] Workout page - log a workout
- [ ] Nutrition page - view nutrition plan
- [ ] Chat page - send message to AI

### Step 5: Monitor Logs
**Render Logs:**
- [ ] Go to your service in Render
- [ ] Click "Logs" tab
- [ ] Should see incoming requests
- [ ] No red error messages

**Vercel Logs:**
- [ ] Go to your project in Vercel
- [ ] Click "Deployments"
- [ ] View deployment details
- [ ] No JavaScript errors

---

## TROUBLESHOOTING DURING DEPLOYMENT

### Backend Won't Start

**Error: `ModuleNotFoundError`**
- [ ] Check requirements.txt is correct
- [ ] In Render/Railway, check build logs
- [ ] Ensure Python 3.11 is selected

**Error: `DATABASE_URL not found`**
- [ ] Database may not be created yet
- [ ] Wait 1-2 minutes for database to initialize
- [ ] Check that DATABASE_URL is in environment variables
- [ ] Restart the service

**Error: `CORS error` in browser console**
- [ ] Check ALLOWED_ORIGINS matches your frontend URL exactly
- [ ] For Render: ALLOWED_ORIGINS = `https://your-vercel-url.com`
- [ ] Restart the backend service in Render/Railway

**Error: `TimeoutError` on endpoints**
- [ ] Database might be initializing
- [ ] Wait 2-3 minutes
- [ ] Check if database is properly connected
- [ ] Restart the service

### Frontend Won't Load

**Error: `VITE_API_URL not loading`**
- [ ] In Vercel, check environment variables are set
- [ ] Variable must be: `VITE_API_URL` (exact name)
- [ ] Value must be: `https://your-backend-url.com`
- [ ] Redeploy after adding variables

**Error: `404 errors calling API`**
- [ ] Check backend URL is correct in VITE_API_URL
- [ ] Ensure backend is running (`/health` endpoint works)
- [ ] Check backend logs for request details

**Error: `CORS error` in browser console**
- [ ] Add frontend URL to backend ALLOWED_ORIGINS
- [ ] Restart backend service
- [ ] Check exact URL matches (no trailing slash, https not http)

### Database Issues

**Error: `Database connection refused`**
- [ ] Wait 2 minutes for database to start
- [ ] Check DATABASE_URL is correct
- [ ] In Render: Use Internal Database URL (not External)
- [ ] Test connection: `psql [DATABASE_URL]`

**Error: `Table already exists`**
- [ ] Database might have old schema
- [ ] Safe to ignore (schema is up-to-date)
- [ ] Check application still works

---

## AFTER DEPLOYMENT SUCCESS

### Step 1: Configure Custom Domain (Optional)
**Render:**
- [ ] In Web Service settings, click "Custom Domains"
- [ ] Add your domain
- [ ] Update DNS CNAME records at your domain provider

**Vercel:**
- [ ] In project settings, click "Domains"
- [ ] Add your domain
- [ ] Update DNS records

### Step 2: Enable SSL/HTTPS
- [ ] Render: Auto-enables HTTPS
- [ ] Vercel: Auto-enables HTTPS
- [ ] Test: `https://your-domain.com` should work

### Step 3: Set Up Monitoring
**Render:**
- [ ] Enable metrics monitoring
- [ ] Set up alerts for errors

**Vercel:**
- [ ] Check "Deployments" tab regularly
- [ ] Monitor function duration

### Step 4: Backup Database
**For PostgreSQL:**
- [ ] Render: Automatic backups (enable in settings)
- [ ] Railway: Automatic backups enabled

### Step 5: Set Up CI/CD (Optional)
- [ ] Both Render and Railway auto-deploy on git push
- [ ] No additional setup needed!

---

## RUNNING THE CHECKLIST

### TODAY - Deploy to Production

```bash
# 1. Local verification
python app.py  # Backend works
npm run build  # Frontend builds
npm run dev    # Frontend dev works

# 2. Commit everything
git add .
git commit -m "Production deployment"
git push origin main

# 3. Deploy backend
# → Choose: Render.com OR Railway.app
# → Follow the steps above
# → Copy the backend URL

# 4. Deploy frontend
# → Go to Vercel
# → Import repo
# → Add VITE_API_URL = [backend URL]
# → Deploy

# 5. Verify all tests pass
curl https://your-backend-url/health
# Open https://your-frontend-url in browser
```

### Success Checklist
- [ ] Backend URL responds to /health
- [ ] Frontend loads without CORS errors
- [ ] Signup/login works
- [ ] Profile creation works
- [ ] Chat messages send successfully
- [ ] No console errors in browser
- [ ] Backend logs show requests

---

## QUICK REFERENCE URLS

After deployment, you'll have:

```
Backend API:
  Production: https://your-backend-url.com
  Health:     https://your-backend-url.com/health
  Docs:       https://your-backend-url.com/docs
  
Frontend:
  Live:       https://your-frontend-url.com
  
Environment Variables Set:
  Backend:
    ENV=production
    GROQ_API_KEY=***
    SECRET_KEY=***
    DATABASE_URL=***
    ALLOWED_ORIGINS=https://your-frontend-url.com
    
  Frontend:
    VITE_API_URL=https://your-backend-url.com
```

---

## MAINTENANCE

### Weekly
- [ ] Check backend error logs
- [ ] Monitor API performance
- [ ] Verify database backups

### Monthly
- [ ] Review and update dependencies
- [ ] Check for security updates
- [ ] Test disaster recovery

### When Issues Occur
1. [ ] Check Render/Railway logs
2. [ ] Check Vercel deployment logs
3. [ ] Check browser DevTools console
4. [ ] Restart the service
5. [ ] Redeploy if needed: `git push origin main`

---

**You're ready to deploy! Follow the steps above.** 🚀

Good luck! Your fitness platform will be live in less than 30 minutes.
