# Security Guidelines for Yael's Recipes

## Environment Variables Security

### ⚠️ CRITICAL: What NOT to Commit

**NEVER commit these files to git:**
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `.env.backup`
- Any file containing real passwords, API keys, or database URLs

### ✅ What's Safe to Commit

- `.env.production.template` - Template with placeholder values
- `SECURITY.md` - This security guide
- `.gitignore` - Git ignore rules

### 🔐 Secret Management

#### Development
1. Copy `.env.production.template` to `.env.local`
2. Fill in your real development values
3. Never commit `.env.local` to git

#### Production (Vercel)
1. Set environment variables directly in Vercel dashboard
2. Never store production secrets in files
3. Use base64 encoding for certificates in Vercel

### 🚨 Security Incident Response

If secrets are accidentally committed:

1. **Immediately rotate all exposed credentials:**
   - Database passwords
   - API keys
   - Email passwords
   - Certificates

2. **Remove from git history:**
   ```bash
   # Remove sensitive files from current directory
   rm -f .env.backup .env.example .env.production

   # Add to .gitignore if not already there
   echo ".env.*" >> .gitignore

   # Commit the removal
   git add -A
   git commit -m "Remove sensitive files and secure .gitignore"
   ```

3. **For exposed database credentials:**
   - Generate new database password in Neon dashboard
   - Update connection string in production environment
   - Update local `.env.local` file

4. **For exposed email credentials:**
   - Revoke Gmail app password
   - Generate new Gmail app password
   - Update EMAIL_PASS in production

5. **For exposed API keys:**
   - Regenerate Cloudinary API keys
   - Update production environment variables

### 🛡️ Best Practices

1. **Use Environment Variables Only**
   ```typescript
   // ✅ Good
   const apiKey = process.env.CLOUDINARY_API_KEY

   // ❌ Bad
   const apiKey = "ak_12345..."
   ```

2. **Validate Environment Variables**
   ```typescript
   if (!process.env.DATABASE_URL) {
     throw new Error('DATABASE_URL is required')
   }
   ```

3. **Use Different Credentials for Different Environments**
   - Development: Local database, test API keys
   - Production: Production database, production API keys

4. **Regular Security Audits**
   - Review `.gitignore` regularly
   - Check for accidentally committed secrets
   - Rotate credentials periodically

### 📋 Pre-commit Checklist

Before every commit, verify:
- [ ] No `.env*` files in `git status`
- [ ] No hardcoded secrets in code
- [ ] All secrets use `process.env.VARIABLE_NAME`
- [ ] `.gitignore` includes all sensitive patterns

### 🔍 Tools for Secret Detection

1. **Git hooks** (recommended):
   ```bash
   # Add to .git/hooks/pre-commit
   #!/bin/bash
   if git diff --cached --name-only | grep -E "\\.env"; then
     echo "ERROR: .env files should not be committed!"
     exit 1
   fi
   ```

2. **GitHub Secret Scanning** (automatic when you push to GitHub)

3. **Local scanning tools:**
   ```bash
   # Install truffleHog for local secret detection
   pip install truffleHog
   truffleHog --regex --entropy=False .
   ```

### 🌐 Production Security

#### Vercel Environment Variables
- Set in Vercel dashboard → Settings → Environment Variables
- Use different values for Preview vs Production
- Enable "Sensitive" flag for secrets

#### Database Security
- Use connection pooling
- Enable SSL (already configured with `sslmode=require`)
- Restrict database access to specific IPs if possible

#### API Security
- CORS properly configured
- Input validation on all endpoints
- Rate limiting (consider adding)

### 📞 Emergency Contacts

If you suspect a security breach:
1. Immediately rotate all credentials
2. Check logs for unusual activity
3. Contact service providers (Neon, Cloudinary, etc.)

### 🔄 Credential Rotation Schedule

**Monthly:**
- Database passwords
- API keys

**Quarterly:**
- Email app passwords
- TLS certificates

**Annually:**
- Review and update security practices
- Audit all environment variables