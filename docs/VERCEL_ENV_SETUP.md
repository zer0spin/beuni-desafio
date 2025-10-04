# 🚀 Vercel Environment Variables Setup

## 📋 Required Environment Variables for Vercel

Configure these environment variables in your Vercel project settings:

### 🌐 API Configuration
```bash
NEXT_PUBLIC_API_URL=https://beuni-desafio-production-41c7.up.railway.app
NEXT_PUBLIC_API_TIMEOUT=10000
```

### 🎯 Application Settings
```bash
NEXT_PUBLIC_APP_NAME=Beuni Birthday Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Corporate Birthday Management Platform
```

### 🔧 Feature Flags
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
NODE_ENV=production
NEXT_PUBLIC_DEV_MODE=false
```

## 🔗 How to Set Environment Variables in Vercel

### Via Vercel Dashboard:
1. Go to your project: https://vercel.com/zer0spin/beuni-frontend-one
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Variable value (e.g., `https://beuni-desafio-production-41c7.up.railway.app`)
   - **Environments**: Select `Production`, `Preview`, and `Development`
4. Click **Save**

### Via Vercel CLI:
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Link to project
cd frontend
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://beuni-desafio-production-41c7.up.railway.app

vercel env add NEXT_PUBLIC_API_TIMEOUT production
# When prompted, enter: 10000

vercel env add NEXT_PUBLIC_APP_NAME production
# When prompted, enter: Beuni Birthday Platform

vercel env add NEXT_PUBLIC_APP_VERSION production
# When prompted, enter: 1.0.0

vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production
# When prompted, enter: false

vercel env add NEXT_PUBLIC_ENABLE_DEBUG production
# When prompted, enter: false

vercel env add NEXT_PUBLIC_DEV_MODE production
# When prompted, enter: false

# Redeploy to apply changes
vercel --prod
```

## 🔄 Current Configuration

### Frontend (Vercel)
- **Production URL**: https://beuni-frontend-one.vercel.app
- **Framework**: Next.js
- **Rewrites**: `/api/*` → Railway API

### Backend (Railway)
- **Production URL**: https://beuni-desafio-production-41c7.up.railway.app
- **Swagger Docs**: https://beuni-desafio-production-41c7.up.railway.app/api/docs

## ✅ Verification Steps

After setting the environment variables:

1. **Trigger a new deployment**:
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Verify the build log** shows the correct `NEXT_PUBLIC_API_URL`

3. **Test the login page**:
   - Go to: https://beuni-frontend-one.vercel.app/login
   - Check browser console for API calls
   - Verify they point to: `https://beuni-frontend-one.vercel.app/api/auth/login`
   - Which rewrites to: `https://beuni-desafio-production-41c7.up.railway.app/auth/login`

4. **Test image loading**:
   - Check profile images load correctly
   - Verify paths use `/api/auth/profile-image/...`

## 🐛 Troubleshooting

### Issue: "Application not found" or 404 errors

**Cause**: Vercel rewrites pointing to wrong Railway URL

**Solution**:
1. Update `frontend/vercel.json` with correct Railway URL
2. Redeploy: `vercel --prod`

### Issue: Images not loading (400 errors)

**Cause**: Image URLs pointing to wrong domain or missing fallback

**Solution**:
1. Ensure images use relative paths `/api/auth/profile-image/...`
2. Backend has fallback for missing images
3. Check CORS allows image requests

### Issue: Login returns 404

**Cause**: API rewrite not working or wrong Railway URL

**Solution**:
1. Check `vercel.json` has correct Railway URL
2. Verify `NEXT_PUBLIC_API_URL` environment variable
3. Test direct API call: `curl https://beuni-desafio-production-41c7.up.railway.app/health`

## 📝 Important Notes

1. **Always use `NEXT_PUBLIC_` prefix** for client-side environment variables
2. **Redeploy after changing environment variables** - they're baked into the build
3. **Use Vercel rewrites** to avoid CORS issues (`/api/*` → Railway)
4. **Test in production** after deployment to verify all settings

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/zer0spin/beuni-frontend-one
- **Railway Dashboard**: https://railway.com/project/bd3d222c-0253-4dfa-bf53-a9add3ea34bc
- **Frontend**: https://beuni-frontend-one.vercel.app
- **Backend API**: https://beuni-desafio-production-41c7.up.railway.app
- **API Docs**: https://beuni-desafio-production-41c7.up.railway.app/api/docs
