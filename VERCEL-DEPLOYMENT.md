# Vercel Deployment Guide

This guide walks you through deploying Yael's Recipes to Vercel (completely free) after setting up your Temporal infrastructure on Render.com.

## Prerequisites

1. ✅ Temporal server deployed on Render.com (from `render.yaml`)
2. ✅ Temporal worker deployed on Render.com
3. ✅ Neon PostgreSQL database created
4. ✅ Cloudinary account configured
5. ✅ Gmail app password generated

## Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "Import Project"
4. Select your `yaels-recipes` repository
5. Vercel will auto-detect it's a Next.js project

### 2. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

#### Database
```env
DATABASE_URL=your-neon-postgresql-connection-string
```

#### Application Settings
```env
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME=Yael's Recipes
```

#### Email Configuration (Gmail SMTP)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=Yael's Recipes <your-email@gmail.com>
NOTIFICATION_EMAILS=your-notification-emails@gmail.com
```

#### Cloudinary (Image Storage)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Temporal Configuration
```env
TEMPORAL_ADDRESS=yaels-recipes-temporal-server.onrender.com:7233
TEMPORAL_NAMESPACE=default
```

### 3. Deploy

1. Click "Deploy"
2. Vercel will automatically:
   - Run `npm install`
   - Run `npx prisma generate`
   - Run `npm run build`
   - Deploy your application

### 4. Post-Deployment Setup

#### 4.1 Run Database Migrations

After first deployment, run migrations via Vercel CLI or Functions:

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Run migration in production environment
vercel env pull .env.production
npx prisma db push --schema=./prisma/schema.prisma
```

**Option B: Via API Route**
Create a temporary migration endpoint or run migrations locally with production DB URL.

#### 4.2 Test Your Deployment

1. Visit `https://your-app-name.vercel.app`
2. Create a test recipe
3. Check that images upload to Cloudinary
4. Verify email notifications are sent
5. Monitor Vercel function logs for any errors

### 5. Domain Configuration (Optional)

#### Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Update DNS records as instructed by Vercel

## Environment Variables Summary

Here's the complete list you need to configure in Vercel:

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | ✅ |
| `NEXT_PUBLIC_APP_NAME` | `Yael's Recipes` | ✅ |
| `EMAIL_HOST` | `smtp.gmail.com` | ✅ |
| `EMAIL_PORT` | `587` | ✅ |
| `EMAIL_SECURE` | `false` | ✅ |
| `EMAIL_USER` | `your-email@gmail.com` | ✅ |
| `EMAIL_PASS` | `your-gmail-app-password` | ✅ |
| `EMAIL_FROM` | `Yael's Recipes <email@gmail.com>` | ✅ |
| `NOTIFICATION_EMAILS` | `admin@gmail.com,manager@gmail.com` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | ✅ |
| `CLOUDINARY_API_KEY` | `123456789012345` | ✅ |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | ✅ |
| `TEMPORAL_ADDRESS` | `yaels-recipes-temporal-server.onrender.com:7233` | ✅ |
| `TEMPORAL_NAMESPACE` | `default` | ✅ |

## Troubleshooting

### Common Issues

#### 1. Build Failures
```
Error: Prisma schema not found
```
**Solution**: Ensure `prisma/schema.prisma` exists and `npx prisma generate` runs in build

#### 2. Database Connection Issues
```
Error: Connection timeout
```
**Solution**:
- Verify `DATABASE_URL` is correct
- Ensure Neon database allows connections
- Check if database is in sleep mode (free tier)

#### 3. Temporal Connection Issues
```
Error: Cannot connect to Temporal server
```
**Solution**:
- Verify Render.com Temporal server is running
- Check `TEMPORAL_ADDRESS` format: `host:port`
- Monitor Render.com service logs

#### 4. Email Issues
```
Error: Invalid login credentials
```
**Solution**:
- Use Gmail App Password (not regular password)
- Enable 2-factor authentication on Gmail
- Verify `EMAIL_USER` and `EMAIL_PASS`

#### 5. Image Upload Issues
```
Error: Cloudinary upload failed
```
**Solution**:
- Verify all three Cloudinary environment variables
- Check Cloudinary dashboard for API usage
- Ensure upload preset allows unsigned uploads

### Performance Optimization

#### Function Timeouts
Vercel free tier has 10s function timeout. Monitor function duration in dashboard.

#### Database Connection Pooling
Consider adding connection pooling for production:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&connection_limit=10&pool_timeout=20"
```

#### Caching
Vercel automatically handles static file caching. API responses are cached based on headers.

### Monitoring

#### Vercel Analytics
Enable in dashboard → Settings → Analytics for free usage metrics.

#### Function Logs
Monitor in dashboard → Functions tab for API route debugging.

#### Performance
Use Vercel Speed Insights for Core Web Vitals monitoring.

## Cost Breakdown

**Vercel Free Tier:**
- ✅ 100GB bandwidth
- ✅ 100 serverless function executions per day
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ Preview deployments

**Total Monthly Cost: $0** 🎉

## Next Steps

1. **Test thoroughly** - Create/edit/delete recipes
2. **Monitor logs** - Check Vercel and Render.com dashboards
3. **Set up monitoring** - Consider adding error tracking
4. **Custom domain** - Add your own domain if needed
5. **Gather feedback** - Share with users and iterate

Your application is now fully deployed and running on a 100% free stack! 🚀