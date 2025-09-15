# Swasthik Health App - Deployment Guide

## 🚀 Deployment Options

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
