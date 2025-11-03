# Production Deployment Setup

## Required Environment Variables for Vercel

Since your Temporal server on Render is not accessible, the application will automatically fall back to direct database access in production.

### Vercel Environment Variables

Add these environment variables to your Vercel project:

```bash
# Database
DATABASE_URL=your_postgresql_database_url

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-gmail@gmail.com
NOTIFICATION_EMAILS=recipient1@example.com,recipient2@example.com

# Cloud Storage (for photo uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# App URL
NEXT_PUBLIC_APP_URL=https://yaels-recipes.vercel.app

# Temporal (will fallback if not accessible)
TEMPORAL_ADDRESS=yaels-recipes-temporal.onrender.com:7233
```

## How it Works

1. **Primary Mode**: Try to connect to Temporal server
2. **Fallback Mode**: If Temporal server is unavailable, use direct database access
3. **Automatic Detection**: The app automatically detects production environment and handles fallback

## Deployment Steps

1. Add all environment variables to your Vercel project
2. Deploy your application
3. The app will work even if Temporal server is not accessible

## Fixing Temporal Server (Optional)

To make Temporal server work properly on Render:

1. Ensure your Temporal server is bound to `0.0.0.0:7233` not `localhost:7233`
2. Configure Render to expose port 7233
3. Check that your worker is running and connected to the same server

## Monitoring

Check your Vercel logs to see which mode is being used:
- `✅ Connected to Temporal Server` - Normal Temporal mode
- `🔄 Using direct database fallback` - Fallback mode