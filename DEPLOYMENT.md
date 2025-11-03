# Deployment Guide for Yael's Recipes

This guide covers deploying the Yael's Recipes application to production using free tier services.

## Architecture Overview

- **Frontend & API**: Vercel (Next.js)
- **Database**: Neon PostgreSQL (Free tier: 3GB)
- **Images**: Cloudinary (Free tier: 25GB)
- **Email**: Gmail SMTP (Free)
- **Temporal Server**: Railway (Free tier: $5/month credit)
- **Temporal Worker**: Railway (Free tier: $5/month credit)

## Prerequisites

1. GitHub account
2. Vercel account (sign up with GitHub)
3. Neon account (PostgreSQL)
4. Cloudinary account
5. Railway account (for Temporal server and worker)

## Step 1: Database Setup (Neon PostgreSQL)

### 1.1 Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project:
   - Project name: `yaels-recipes`
   - PostgreSQL version: 15
   - Region: Choose closest to your users
4. Copy the connection string

### 1.2 Update Environment Variables

Create `.env.production` with:
```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# Next.js
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="recipesyael@gmail.com"
EMAIL_PASS="ecsq tobu myqo rwbo"
EMAIL_FROM="Yael's Recipes <recipesyael@gmail.com>"
NOTIFICATION_EMAILS="walla199811@gmail.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Temporal Server (Self-hosted on Railway)
TEMPORAL_ADDRESS="your-railway-temporal-server.railway.app:7233"
TEMPORAL_NAMESPACE="default"
```

## Step 2: Cloudinary Setup

### 2.1 Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard → Account Details
4. Copy:
   - Cloud name
   - API Key
   - API Secret

### 2.2 Configure Image Upload Settings

Your free tier includes:
- 25GB storage
- 25GB monthly bandwidth
- Image transformations

## Step 3: Prepare Code for Production

### 3.1 Add Production Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

### 3.2 Create Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "EMAIL_HOST": "@email_host",
    "EMAIL_PORT": "@email_port",
    "EMAIL_USER": "@email_user",
    "EMAIL_PASS": "@email_pass",
    "EMAIL_FROM": "@email_from",
    "NOTIFICATION_EMAILS": "@notification_emails",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret",
    "NEXT_PUBLIC_APP_URL": "@next_public_app_url",
    "TEMPORAL_ADDRESS": "@temporal_address"
  }
}
```

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Ready for production deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/yaels-recipes.git
git branch -M main
git push -u origin main
```

### 4.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 4.3 Add Environment Variables in Vercel

In Vercel dashboard → Settings → Environment Variables, add:

- `DATABASE_URL`: Your Neon connection string
- `EMAIL_HOST`: smtp.gmail.com
- `EMAIL_PORT`: 587
- `EMAIL_USER`: recipesyael@gmail.com
- `EMAIL_PASS`: Your Gmail app password
- `EMAIL_FROM`: Yael's Recipes <recipesyael@gmail.com>
- `NOTIFICATION_EMAILS`: walla199811@gmail.com
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `NEXT_PUBLIC_APP_URL`: https://your-app.vercel.app
- `TEMPORAL_ADDRESS`: your-railway-temporal-server.railway.app:7233

### 4.4 Deploy Database Schema

After first deployment:
```bash
# Deploy database migrations to Neon
npx prisma migrate deploy
npx prisma db seed
```

## Step 5: Set Up Self-Hosted Temporal on Railway

### 5.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 5.2 Deploy Temporal Server

1. **Connect your GitHub repository**
2. **Add new service** → **Deploy from GitHub repo**
3. **Service name**: `yaels-recipes-temporal-server`
4. **Environment variables**:
   ```
   PORT=7233
   TEMPORAL_UI_PORT=8080
   NODE_ENV=production
   ```
5. **Settings**:
   - Build Command: `npm install`
   - Start Command: `npm run temporal:server:prod`
6. **Deploy** and note the Railway URL

### 5.3 Deploy Temporal Worker

1. **Add another service** to the same Railway project
2. **Service name**: `yaels-recipes-temporal-worker`
3. **Environment variables** (copy from your local .env.local):
   ```
   NODE_ENV=production
   TEMPORAL_ADDRESS=yaels-recipes-temporal-server.railway.app:7233
   DATABASE_URL=your-neon-connection-string
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=Yael's Recipes <your-email@gmail.com>
   NOTIFICATION_EMAILS=your-notification-emails@gmail.com
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. **Settings**:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run temporal:worker`

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain in Vercel

1. Go to Vercel dashboard → Domains
2. Add your domain
3. Configure DNS records as instructed

### 6.2 Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain.

## Step 7: Monitoring & Maintenance

### 7.1 Vercel Analytics

- Enable Vercel Analytics in dashboard
- Monitor performance and errors

### 7.2 Database Monitoring

- Monitor Neon database usage
- Set up alerts for storage limits

### 7.3 Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for user session replay

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Ensure SSL mode is enabled for Neon

2. **Email Not Working**
   - Check Gmail app password
   - Verify SMTP settings

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check API key permissions

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Performance Optimization

1. **Next.js Optimizations**
   - Enable Image Optimization
   - Use dynamic imports for heavy components
   - Implement proper caching headers

2. **Database Optimizations**
   - Add database indexes for frequently queried fields
   - Use connection pooling

3. **CDN & Caching**
   - Vercel automatically provides CDN
   - Configure appropriate cache headers

## Cost Monitoring

### Free Tier Limits

- **Vercel**: 100GB bandwidth, 6000 build minutes
- **Neon**: 512MB storage, 1 database
- **Cloudinary**: 25GB storage, 25GB bandwidth
- **Railway**: 500 hours/month, 1GB RAM

### Scaling Considerations

When you outgrow free tiers:
1. Vercel Pro: $20/month
2. Neon Pro: $19/month
3. Cloudinary Pro: $89/month
4. Railway Pro: $5/month per service

## Security Checklist

- [x] Environment variables properly configured
- [x] Database connections use SSL
- [x] API routes have proper validation
- [x] File uploads are secured
- [x] Email templates are sanitized
- [x] CORS properly configured

## Backup Strategy

1. **Database Backups**
   - Neon provides automatic backups
   - Consider additional backup strategy for critical data

2. **Code Backups**
   - GitHub repository serves as code backup
   - Tag releases for rollback capability

3. **Image Backups**
   - Cloudinary handles image redundancy
   - Consider periodic export for critical images