# TaskFlow - Complete Deployment Guide

## 🚀 Quick Overview

- **Frontend**: React + Vite deployed on **Vercel**
- **Backend**: Node.js + Express deployed on **Render**
- **Database**: MongoDB Atlas (Cloud)
- **Payments**: Stripe Integration

---

## 📋 Prerequisites

1. GitHub account with repository access
2. Vercel account (vercel.com)
3. Render account (render.com)
4. MongoDB Atlas account (mongodb.com/cloud)
5. Stripe account (stripe.com)

---

## 🔧 Backend Deployment (Render)

### Step 1: Set Up MongoDB Atlas

1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Create a new cluster (free tier available)
3. Create a database user (save username & password)
4. **CRITICAL**: Whitelist IP → Allow "0.0.0.0/0" (Render IPs are dynamic)
5. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/taskflow`

### Step 2: Prepare Backend for Render

Ensure `backend/package.json` has:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 3: Deploy to Render

1. Go to [render.com](https://render.com) → **Dashboard**
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy from GitHub"** → Connect your repository
4. Configure:
   - **Service Name**: `taskflow-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables** (copy from `backend/.env.example`):
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
     JWT_SECRET=your_super_secret_key_at_least_32_chars_long_here
     JWT_EXPIRES_IN=7d
     CLIENT_URL=https://your-frontend-domain.vercel.app
     STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
     STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
     STRIPE_PRO_PRICE_ID=price_xxxxx
     STRIPE_TEAMS_PRICE_ID=price_xxxxx
     NODE_ENV=production
     PORT=4000
     ```

5. Click **"Deploy"** and wait for build to complete
6. Copy your backend URL: `https://taskflow-api.onrender.com`

### Step 4: Verify Backend Health

Visit: `https://taskflow-api.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "env": "production",
  "mongo": "connected",
  "ts": "2026-06-29T18:36:00.000Z"
}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Configure Environment Variables

Create/Update `frontend/.env.local`:
```
VITE_API_URL=https://taskflow-api.onrender.com
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Dashboard**
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"** → Choose your GitHub repo
4. Configure:
   - **Project Name**: `taskflow-frontend`
   - **Framework**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://taskflow-api.onrender.com
     ```

5. Click **"Deploy"** 
6. Copy your frontend URL: `https://taskflow-frontend.vercel.app`

### Step 3: Update Backend CORS

Return to Render dashboard:
1. Go to your **taskflow-api** service
2. Click **"Environment"** 
3. Update `CLIENT_URL` to your Vercel URL: `https://taskflow-frontend.vercel.app`
4. Click **"Save"** → **"Redeploy"**

---

## 🔗 Connecting Frontend & Backend

### API Client Setup

The frontend uses `src/lib/api.js` for all API calls:

```javascript
import { api } from './lib/api';

// Login
const { token, user } = await api.login({ email, password });

// Get tasks
const tasks = await api.getTasks();

// Create task
const newTask = await api.createTask({ title: 'My Task', description: '...' });
```

### Vercel Rewrites

The `frontend/vercel.json` configuration handles routing:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://taskflow-api.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This enables:
- ✅ API calls to `/api/*` → proxied to backend
- ✅ SPA routing (all unknown routes → `index.html`)

---

## ✅ Testing the Connection

### 1. Test Backend Health
```bash
curl https://taskflow-api.onrender.com/health
```

Should return `{"status": "ok", "mongo": "connected", ...}`

### 2. Test Registration
```bash
curl -X POST https://taskflow-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'
```

### 3. Visit Frontend
Go to: `https://taskflow-frontend.vercel.app/login`

Try logging in with credentials from step 2.

---

## 🚨 Troubleshooting

### CORS Error: "Access to XMLHttpRequest blocked"
- **Cause**: `CLIENT_URL` doesn't match frontend domain
- **Solution**: 
  1. Check Render environment variables
  2. Ensure `CLIENT_URL=https://your-vercel-app.vercel.app` (exactly)
  3. Redeploy backend after updating

### "Failed to fetch" during login
- **Cause**: `VITE_API_URL` not set or wrong backend URL
- **Solution**:
  1. Check `frontend/.env.local` has `VITE_API_URL=https://taskflow-api.onrender.com`
  2. Verify backend is running: `curl https://taskflow-api.onrender.com/health`
  3. Redeploy frontend

### MongoDB Connection Failed
- **Cause**: IP whitelist or connection string error
- **Solution**:
  1. MongoDB Atlas → Network Access → ensure `0.0.0.0/0` is whitelisted
  2. Verify `MONGODB_URI` format (check for typos)
  3. Test connection from Render shell

### JWT Token Errors
- **Cause**: `JWT_SECRET` is too short or inconsistent
- **Solution**: Ensure `JWT_SECRET` is at least 32 random characters and same in backend env

### 404 on Frontend Routes
- **Cause**: `vercel.json` not configured correctly
- **Solution**: Verify `frontend/vercel.json` has the rewrite rules

---

## 📚 Environment Variables Reference

### Backend (.env)
```
MONGODB_URI              MongoDB connection string
JWT_SECRET               Secret for signing tokens (min 32 chars)
JWT_EXPIRES_IN           Token expiration (e.g., "7d")
CLIENT_URL               Frontend URL for CORS
STRIPE_SECRET_KEY        Stripe secret key (production)
STRIPE_WEBHOOK_SECRET    Stripe webhook secret
STRIPE_PRO_PRICE_ID      Stripe Pro plan ID
STRIPE_TEAMS_PRICE_ID    Stripe Teams plan ID
NODE_ENV                 "production" or "development"
PORT                     Server port (default: 4000)
```

### Frontend (.env.local)
```
VITE_API_URL             Backend API URL (e.g., https://taskflow-api.onrender.com)
```

---

## 🔐 Security Checklist

- [ ] MongoDB IP whitelist includes `0.0.0.0/0`
- [ ] `JWT_SECRET` is at least 32 random characters
- [ ] Stripe keys are **production** keys (not test)
- [ ] `CLIENT_URL` matches frontend domain exactly
- [ ] CORS allows only your frontend domain
- [ ] `.env` files are in `.gitignore`
- [ ] No secrets in `.env.example`
- [ ] Use HTTPS for all URLs

---

## 📱 Development vs Production

### Local Development
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:4000

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Frontend automatically proxies `/api/*` calls to `http://localhost:4000` via `vite.config.js`.

### Production
- **Backend**: `https://taskflow-api.onrender.com`
- **Frontend**: `https://taskflow-frontend.vercel.app`
- API calls use `VITE_API_URL` environment variable
- Vercel rewrites `/api/*` to backend

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

1. **Render**: Automatically deploys when you push to `main` branch
2. **Vercel**: Automatically deploys when you push to `main` branch

To trigger manual redeploys:
- **Render**: Dashboard → Service → "Manual Deploy"
- **Vercel**: Dashboard → Project → "Redeploy"

---

## 📱 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Backend Health**: https://taskflow-api.onrender.com/health
- **Frontend App**: https://taskflow-frontend.vercel.app/login

---

## 💡 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Test login flow
4. ✅ Create tasks and verify CRUD operations
5. ✅ Test Stripe payment flow
6. ✅ Monitor logs for errors

---

**🎉 Your app is now live and connected! Good luck!**
