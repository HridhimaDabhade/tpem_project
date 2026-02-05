# ⚡ Quick Start Deployment Guide

## 🎯 Deploy in 15 Minutes

### Prerequisites
- GitHub account
- MongoDB Atlas already configured ✅
- Code ready to deploy ✅

---

## 📦 Step 1: Push to GitHub (2 minutes)

```bash
cd ~/hridhima/tpem_project

# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/tpeml-recruitment.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 2: Deploy Backend to Railway (5 minutes)

### 1. Create Railway Account
- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose `tpeml-recruitment` repository
- Railway auto-detects Python

### 3. Configure Settings
Click on your service → Settings:

**Root Directory:**
```
backend
```

**Start Command:** (Railway auto-detects, but verify)
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 4. Add Environment Variables
Click "Variables" tab, add these:

```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-key-at-least-32-chars
ALLOWED_ORIGINS=*
ENVIRONMENT=production
```

**Generate JWT Secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Deploy
- Railway starts building automatically
- Wait 2-3 minutes
- Click "Deployments" to see progress
- Once done, click "Settings" → "Networking" → "Generate Domain"
- **Save your backend URL:** `https://tpeml-backend-production.up.railway.app`

---

## 🌐 Step 3: Deploy Frontend to Vercel (5 minutes)

### 1. Create Vercel Account
- Go to https://vercel.com
- Click "Sign Up" → Continue with GitHub
- Authorize Vercel

### 2. Import Project
- Click "Add New..." → "Project"
- Select `tpeml-recruitment` repository
- Click "Import"

### 3. Configure Project
**Framework Preset:** Vite (auto-detected)

**Root Directory:**
```
frontend
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

### 4. Environment Variables
Click "Environment Variables" section:

**Variable Name:**
```
VITE_API_URL
```

**Value:** (Your Railway backend URL)
```
https://tpeml-backend-production.up.railway.app
```

### 5. Deploy
- Click "Deploy"
- Wait 1-2 minutes
- Vercel builds and deploys
- **Get your frontend URL:** `https://tpeml-recruitment.vercel.app`

---

## ⚙️ Step 4: Final Configuration (3 minutes)

### 1. Update CORS on Backend

Go back to Railway → Your Service → Variables:

**Update ALLOWED_ORIGINS:**
```
https://tpeml-recruitment.vercel.app
```

### 2. Update QR Code URL

**In Railway:**
- Go to Variables
- Add new variable:

```env
FRONTEND_URL=https://tpeml-recruitment.vercel.app
```

**Note:** You'll need to update `backend/routers/qr_router.py` to use this environment variable in a future update.

### 3. Verify Deployment

**Test Backend:**
```bash
curl https://YOUR-BACKEND-URL.railway.app/health
```

Should return: `{"status":"ok"}`

**Test Frontend:**
Open in browser: `https://YOUR-FRONTEND-URL.vercel.app`

---

## 🎉 Step 5: Create Admin User

### Option 1: Using MongoDB Atlas UI

1. Go to MongoDB Atlas → Collections
2. Select `users` collection
3. Click "Insert Document"
4. Paste this JSON:

```json
{
  "email": "admin@tpeml.com",
  "full_name": "Admin User",
  "role": "admin",
  "hashed_password": "PASTE_HASHED_PASSWORD_HERE",
  "created_at": {"$date": "2026-01-31T00:00:00Z"}
}
```

### Generate Password Hash:
```python
# Run this locally
import bcrypt
password = "YourSecurePassword123!"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))
```

### Option 2: Using Railway Shell

1. Go to Railway → Your Service → Settings
2. Find "Deployment Logs" or use Railway CLI
3. Run:
```bash
python init_db.py
```

---

## ✅ Testing Your Deployment

### 1. Test Login
- Go to `https://YOUR-FRONTEND-URL.vercel.app/login`
- Login with admin credentials
- Should redirect to dashboard

### 2. Test Public Form
- Go to `https://YOUR-FRONTEND-URL.vercel.app/apply`
- Should show registration form (no login needed)

### 3. Test QR Code
- Login as admin
- Click "QR Code" in navigation
- Should generate QR code
- Scan with phone → should open `/apply`

### 4. Test Candidate Creation
- Go to Dashboard → "Onboard New Candidate"
- Fill form and submit
- Should create candidate successfully

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot connect to backend"

**Fix:** Update CORS on backend
```env
# In Railway Variables
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://www.yourdomain.com
```

### Issue: "MongoDB connection failed"

**Fix:** Check IP whitelist in MongoDB Atlas
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow from anywhere)
3. Wait 1-2 minutes for update

### Issue: "401 Unauthorized on all API calls"

**Fix:** Check JWT secret matches and is set in both places

### Issue: "QR code shows localhost URL"

**Fix:** Update environment variable in Railway:
```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

## 📱 Share Your Application

### Public Form Link
```
https://YOUR-FRONTEND-URL.vercel.app/apply
```

### QR Code
1. Login as Admin/HR
2. Go to "QR Code" page
3. Download QR code
4. Share at recruitment drives!

---

## 💰 Cost

### Free Tier (Perfect for Testing):
- **Railway:** 500 hours/month free
- **Vercel:** Unlimited deployments
- **MongoDB Atlas:** 512MB free
- **Total:** $0/month

### Production (Recommended):
- **Railway Starter:** $5/month
- **Vercel:** Free
- **MongoDB Atlas:** Free or $9/month for M2
- **Total:** $5-14/month

---

## 🎯 Next Steps

### After Deployment:
1. [ ] Test all features thoroughly
2. [ ] Create 2-3 test candidates
3. [ ] Share public form link with candidates
4. [ ] Monitor application logs
5. [ ] Set up custom domain (optional)

### Custom Domain Setup (Optional):
1. Buy domain from Namecheap/GoDaddy
2. In Vercel → Settings → Domains → Add domain
3. Update DNS records as instructed
4. Update CORS in Railway with new domain

---

## 📞 Support

**If stuck:**
1. Check Railway/Vercel deployment logs
2. Check browser console (F12) for frontend errors
3. Test backend endpoints with curl
4. Verify environment variables are set correctly
5. Check MongoDB Atlas network access

**Logs:**
- Railway: Project → Deployments → Click on deployment → View logs
- Vercel: Project → Deployments → Click on deployment → View logs

---

## 🔄 Continuous Deployment

**Automatic Updates:**
- Push code to GitHub → Railway auto-deploys backend
- Push code to GitHub → Vercel auto-deploys frontend
- No manual steps needed!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Both platforms will auto-deploy in 1-2 minutes
```

---

## ✨ You're Live!

Your TPEML Recruitment Portal is now live and accessible to candidates!

**Backend:** `https://YOUR-BACKEND.railway.app`  
**Frontend:** `https://YOUR-FRONTEND.vercel.app`  
**Public Form:** `https://YOUR-FRONTEND.vercel.app/apply`

Share the public form QR code at recruitment drives and campuses! 🎉

---

**Deployment Date:** _______________  
**Backend URL:** _______________  
**Frontend URL:** _______________  
**Admin Email:** _______________
