# 100% Free Deployment Guide

This guide shows you how to deploy Yael's Recipes using **completely free** services.

## 🆓 **Free Architecture Overview**

- **Frontend & API**: Vercel (Next.js) - 100% Free
- **Database**: Neon PostgreSQL (3GB) - 100% Free
- **Images**: Cloudinary (25GB) - 100% Free
- **Email**: Gmail SMTP - 100% Free
- **Temporal Server**: Render.com / Fly.io / Koyeb - 100% Free
- **Temporal Worker**: Same platform - 100% Free

**Total Cost: $0/month forever** ✨

## 🎯 **Option 1: Fly.io (Recommended)**

### Why Fly.io?
- ✅ **3 shared CPU VMs** (256MB each)
- ✅ **No auto-sleep** (always available)
- ✅ **160GB bandwidth**
- ✅ **Easy binary installation** (perfect for Temporal CLI)
- ✅ **Global edge locations**

### Setup Steps:

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New" → "Blueprint"
   - Connect your repository
   - Select `render.yaml` file
   - Set environment variables in dashboard

3. **Environment Variables to Set:**
   ```env
   DATABASE_URL=your-neon-connection-string
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=Yael's Recipes <your-email@gmail.com>
   NOTIFICATION_EMAILS=your-notification-emails@gmail.com
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Get Your Temporal URL**
   - After deployment: `yaels-recipes-temporal-server.onrender.com:7233`

## 🚀 **Option 2: Fly.io (Always-On)**

### Why Fly.io?
- ✅ **3 shared CPU VMs** (256MB each)
- ✅ **No auto-sleep** (always available)
- ✅ **160GB bandwidth**
- ✅ **Global edge locations**

### Setup Steps:

1. **Install Fly CLI**
   ```bash
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Create Fly Account & Deploy**
   ```bash
   # Login
   flyctl auth signup

   # Deploy Temporal Server
   flyctl launch --config fly.toml

   # Deploy Temporal Worker (create second app)
   flyctl launch --name yaels-recipes-worker
   ```

3. **Set Environment Variables**
   ```bash
   flyctl secrets set DATABASE_URL="your-neon-connection-string"
   flyctl secrets set EMAIL_USER="your-email@gmail.com"
   flyctl secrets set EMAIL_PASS="your-gmail-app-password"
   # ... etc
   ```

## ⚡ **Option 3: Koyeb (Simplest)**

### Why Koyeb?
- ✅ **512MB RAM, 0.1 CPU**
- ✅ **100GB bandwidth**
- ✅ **No auto-sleep**
- ✅ **Docker or git deployment**

### Setup Steps:

1. **Create Koyeb Account**
   - Go to [koyeb.com](https://koyeb.com)
   - Sign up with GitHub

2. **Deploy Service**
   - Create new service
   - Select "GitHub" source
   - Choose your repository
   - Set build command: `npm install`
   - Set run command: `npm run temporal:server:prod`

3. **Add Worker Service**
   - Create another service
   - Same repository
   - Set run command: `npm run temporal:worker`

## 🔧 **Vercel Deployment (Next.js App)**

Once your Temporal infrastructure is running on Render.com:

1. **Follow the detailed guide**: See `VERCEL-DEPLOYMENT.md` for complete step-by-step instructions
2. **Quick summary**:
   - Import repository to Vercel
   - Configure 15 environment variables
   - Deploy automatically
   - Run database migrations
   - Test functionality

**Complete deployment guide**: [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

## 📊 **Free Tier Limits Comparison**

| Service | CPU | RAM | Bandwidth | Storage | Always On? |
|---------|-----|-----|-----------|---------|------------|
| **Render.com** | Shared | 512MB | Unlimited | 1GB | ❌ (sleeps after 15min) |
| **Fly.io** | Shared | 256MB | 160GB | 3GB | ✅ |
| **Koyeb** | 0.1 CPU | 512MB | 100GB | 2.5GB | ✅ |

## 🎯 **My Recommendation: Render.com (Fixed)**

**Why?**
- Most generous RAM (512MB vs 256MB)
- Easiest deployment with `render.yaml` Blueprint
- Auto-wakes on requests (sleep isn't a problem)
- **Fixed**: Temporal CLI now properly installed and accessible
- Can upgrade to always-on for $7/month later

**Updated render.yaml configuration:**
- ✅ Fixed binary path issue: `./temporal` instead of `temporal`
- ✅ Proper installation: `curl -sSf https://temporal.download/cli.sh | sh && chmod +x temporal`
- ✅ Correct port configuration for Render.com

## 🔍 **Troubleshooting Free Deployments**

### Render.com Issues:
- **Service sleeping**: First request takes 10-15 seconds (normal)
- **Build failing**: Check build logs in dashboard
- **Environment variables**: Set in dashboard, not in code

### Fly.io Issues:
- **Memory limits**: Use `flyctl scale memory 256` if needed
- **Region issues**: Deploy to closest region with `flyctl regions set`
- **Secrets**: Use `flyctl secrets set` not environment variables

### Koyeb Issues:
- **Build timeout**: Increase build timeout in settings
- **Port binding**: Make sure app listens on $PORT
- **Health checks**: Add `/health` endpoint if needed

## 🚀 **Performance Tips for Free Tiers**

1. **Optimize Memory Usage**
   - Enable Node.js production mode
   - Use `--max-old-space-size=400` for 512MB containers
   - Avoid memory leaks in long-running processes

2. **Handle Sleep/Wake (Render.com)**
   - First request after sleep takes ~15 seconds
   - Consider implementing retry logic in frontend
   - Use simple health check endpoint

3. **Monitor Resource Usage**
   - Check logs regularly
   - Monitor memory consumption
   - Set up alerts for service failures

## 💡 **Pro Tips**

1. **Use Environment-Based Configuration**
   ```typescript
   const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7234'
   ```

2. **Implement Graceful Degradation**
   - If Temporal is unavailable, log error but don't crash
   - Provide user feedback about background processes

3. **Free Monitoring**
   - Use Vercel Analytics (free)
   - Check service logs regularly
   - Set up email alerts for failures

Your entire production stack will cost **$0/month** and handle moderate traffic perfectly! 🎉