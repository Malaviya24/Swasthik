# Swasthik Health App - Deployment Guide

## 🚀 Deployment Strategy: Vercel (Frontend) + Render (Backend)

This guide covers deploying your Swasthik Health App with:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)

## 🔧 Backend Deployment on Render

### Step 1: Create Render Account and Service

1. Go to [render.com](https://render.com) and create an account
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Service Settings:**
- **Name**: `swasthik-health-backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build:backend`
- **Start Command**: `npm run start:unix`
- **Instance Type**: Free tier (sufficient for testing)

### Step 2: Set Environment Variables in Render

Go to your service → **Environment** and add:

```bash
NODE_ENV=production
PORT=10000
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
NEWSDATA_API_KEY=your_newsdata_api_key_here
LOCATIONIQ_API_KEY=your_locationiq_api_key_here
SPEECHMATICS_API_KEY=your_speechmatics_key_optional
```

### Step 3: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-3 minutes)
3. Copy your backend URL (e.g., `https://swasthik-health-backend.onrender.com`)

## 🌐 Frontend Deployment on Vercel

### Step 1: Create Vercel Account and Project

1. Go to [vercel.com](https://vercel.com) and create an account
2. Click **"New Project"** → **"Import Git Repository"**
3. Select your GitHub repository

### Step 2: Configure Build Settings

**Framework Preset**: `Vite`
**Root Directory**: `client`
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### Step 3: Set Environment Variables in Vercel

Go to your project → **Settings** → **Environment Variables** and add:

```bash
VITE_API_URL=https://your-render-backend-url.onrender.com
```

Replace `your-render-backend-url` with your actual Render backend URL.

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (usually 1-2 minutes)
3. Visit your Vercel URL to test the app

## ✅ Testing Your Deployment

### Test These Features:

1. **AI Chatbot** - Should work with real Gemini responses
2. **Health News** - Should fetch real news (if API key is valid)
3. **Health Centers** - Location-based search
4. **Voice Input** - Audio transcription
5. **Symptom Checker** - AI-powered analysis
6. **Reminders** - Full CRUD functionality

### Troubleshooting:

If features don't work:
1. Check **Render logs** for backend errors
2. Check **Vercel function logs** for frontend issues
3. Verify environment variables are set correctly
4. Ensure CORS is properly configured (should work by default)

## 📝 Quick Deployment Checklist

### Backend (Render):
- ✅ Repository connected
- ✅ Build command: `npm install && npm run build:backend`
- ✅ Start command: `npm run start:unix`
- ✅ Environment variables set (GEMINI_API_KEY, NEWSDATA_API_KEY, etc.)
- ✅ Service deployed and running

### Frontend (Vercel):
- ✅ Repository connected
- ✅ Framework: Vite
- ✅ Build command: `npm run build:frontend`
- ✅ Output directory: `dist/public`
- ✅ Environment variable: `VITE_API_URL` set to Render backend URL
- ✅ Site deployed and accessible

## 💰 Cost Analysis

**Free Tier (Perfect for testing):**
- **Render**: Free tier (750 hours/month)
- **Vercel**: Free tier (100GB bandwidth)
- **Total**: $0/month

**Production Ready:**
- **Render**: $7/month (Starter plan)
- **Vercel**: Free tier sufficient for most apps
- **Total**: $7/month

## 🔄 Auto-Deployment

Both platforms support automatic deployment:
- **Push to main branch** → Automatic deployment
- **Pull requests** → Preview deployments

---

## Alternative Deployment Options

### Frontend (Vercel) - RECOMMENDED
**Vercel** is perfect for React/Vite applications with excellent performance and easy deployment.

#### Steps to Deploy Frontend on Vercel:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from client directory**:
   ```bash
   cd client
   vercel
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_LOCATIONIQ_API_KEY`
   - `VITE_NEWSDATA_API_KEY`
   - `VITE_SPEECHMATICS_API_KEY`

5. **Update API URLs** in your frontend code to point to your backend URL.

### Backend Options

#### Option 1: Railway (RECOMMENDED)
- **Best for**: Node.js/Express apps
- **Pricing**: Free tier available, then $5/month
- **Features**: Auto-deployment, database support, environment variables
- **URL**: https://railway.app

#### Option 2: Render
- **Best for**: Full-stack applications
- **Pricing**: Free tier available, then $7/month
- **Features**: Auto-deployment, database support
- **URL**: https://render.com

#### Option 3: Heroku
- **Best for**: Established platform
- **Pricing**: $7/month (no free tier)
- **Features**: Easy deployment, add-ons
- **URL**: https://heroku.com

#### Option 4: DigitalOcean App Platform
- **Best for**: Scalable applications
- **Pricing**: $5/month
- **Features**: Auto-scaling, database support
- **URL**: https://cloud.digitalocean.com

## 🔧 Backend Deployment Steps (Railway)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project**:
   ```bash
   railway init
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set GEMINI_API_KEY=your_key_here
   railway variables set LOCATIONIQ_API_KEY=your_key_here
   railway variables set NEWSDATA_API_KEY=your_key_here
   railway variables set SPEECHMATICS_API_KEY=your_key_here
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

## 🌐 Domain Setup

1. **Custom Domain** (Optional):
   - Vercel: Add custom domain in dashboard
   - Railway: Add custom domain in project settings

2. **SSL Certificates**: Automatically handled by both platforms

## 📊 Monitoring

- **Vercel**: Built-in analytics and performance monitoring
- **Railway**: Built-in logs and metrics
- **Firebase**: Analytics and crash reporting

## 🔄 CI/CD

Both platforms support automatic deployment from GitHub:
- Push to main branch → Auto-deploy
- Pull requests → Preview deployments

## 💰 Cost Estimation

### Free Tier (Development):
- **Vercel**: Free (100GB bandwidth/month)
- **Railway**: Free ($5 credit/month)
- **Total**: $0/month

### Production Tier:
- **Vercel**: $20/month (Pro plan)
- **Railway**: $5/month (Hobby plan)
- **Total**: $25/month

## 🚀 Quick Start Commands

```bash
# Frontend (Vercel)
cd client
vercel

# Backend (Railway)
railway login
railway init
railway up
```

## 📝 Notes

- Update API URLs in frontend to point to deployed backend
- Set up environment variables in both platforms
- Test all functionality after deployment
- Set up monitoring and alerts
