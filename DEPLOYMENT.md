# StudentOS - Deployment Guide

This guide covers deploying the StudentOS application:
- **Backend** deploymentto Railway
- **Frontend** deployment to Vercel

---

## Prerequisites

1. **Railway Account**: Create one at [railway.app](https://railway.app)
2. **Vercel Account**: Create one at [vercel.com](https://vercel.com)
3. **GitHub** repository with your code pushed
4. **MongoDB Atlas** database set up with a connection string

---

## Backend Deployment on Railway

### Step 1: Prepare Your Environment Variables

Before deploying, ensure all required environment variables are set:

- `MONGODB_URL` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong secret key for JWT (use a random string)
- `FRONTEND_URL` - Your Vercel frontend URL (will be set after frontend deployment)
- `PORT` - Railway will automatically set this (optional to define)
- `NODE_ENV` - Set to `production`

### Step 2: Deploy to Railway

**Option A: Using Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# In the backend directory, link to Railway
cd backend
railway init

# Add environment variables
railway variables set MONGODB_URL "your-mongodb-url"
railway variables set JWT_SECRET "your-super-secret-key"
railway variables set FRONTEND_URL "https://your-vercel-domain.vercel.app"
railway variables set NODE_ENV "production"

# Deploy
railway up
```

**Option B: Using GitHub Connection (Easier)**

1. Go to [railway.app](https://railway.app/dashboard)
2. Create a new project
3. Select "Deploy from GitHub repo"
4. Connect your GitHub repository
5. Select the backend folder as your root directory
6. Add environment variables in the Railway dashboard:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
7. Railway will automatically build and deploy on every push to main

### Step 3: Get Your Backend URL

After deployment, Railway will provide a public URL like:
```
https://your-project.railway.app
```

Save this URL - you'll need it for the frontend configuration.

---

## Frontend Deployment on Vercel

### Step 1: Prepare Environment Variables

Update your frontend environment for production:

**File: `frontend/.env.production`**

```env
VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
VITE_ENV=production
```

Replace `your-railway-backend-url.railway.app` with your actual Railway backend URL.

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# In the frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to your Vercel account
# - Link to your GitHub repository
# - Set Root directory to: frontend
# - Configure environment variables when prompted
```

**Option B: Using Vercel Dashboard (Easiest)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL` = Your Railway backend URL
   - `VITE_ENV` = `production`
6. Click "Deploy"

Vercel will automatically deploy on every push to your main branch.

### Step 3: Update Backend CORS

After getting your Vercel frontend URL, update your Railway backend environment:

```bash
# Using Railway CLI
railway variables set FRONTEND_URL "https://your-vercel-domain.vercel.app"

# Or through Railway Dashboard
# Edit variables and update FRONTEND_URL
```

---

## Local Development

### Backend

```bash
cd backend

# Install dependencies (first time only)
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your local MongoDB URL and secret

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local (should point to http://localhost:5000 for local backend)

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Port server listens on |
| `NODE_ENV` | No | development | Environment (development/production) |
| `MONGODB_URL` | **Yes** | - | MongoDB connection string |
| `JWT_SECRET` | **Yes** | - | Secret for JWT signing |
| `JWT_EXPIRY` | No | 7d | JWT token expiration |
| `FRONTEND_URL` | No | localhost:3000 | Frontend origin for CORS |
| `DEMO_MODE` | No | false | Enable/disable demo mode |

### Frontend (.env.*)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | **Yes** | http://localhost:5000 | Backend API URL |
| `VITE_ENV` | No | development | Environment type |

---

## Troubleshooting

### Backend Issues

**Port already in use**
- Railway automatically assigns a port; it won't conflict
- Locally, change PORT in .env to a different value

**MongoDB connection fails**
- Verify `MONGODB_URL` is correct
- Check MongoDB Atlas allows your IP (or enable 0.0.0.0)
- Ensure database name in URL exists

**CORS errors in frontend**
- Verify `FRONTEND_URL` in backend env matches your frontend URL exactly
- Check for trailing slashes: `https://example.vercel.app` (no trailing slash)

### Frontend Issues

**API calls return 404**
- Verify `VITE_API_BASE_URL` is correct
- Check backend is running and accessible
- Vercel might cache old env vars; redeploy after changing

**Blank page deployed**
- Check `npm run build` completes successfully
- Verify `vite.config.js` is properly configured
- Check Vercel deployment logs for build errors

---

## Security Checklist

- [ ] `JWT_SECRET` is a strong, random value (not a simple string)
- [ ] `.env` files are in `.gitignore` and never committed
- [ ] `.env.example` has example values, no real secrets
- [ ] HTTPS is enabled on both Railway and Vercel (automatic)
- [ ] CORS is configured for your specific frontend URL
- [ ] Database credentials are stored in `MONGODB_URL` only
- [ ] Passwords are hashed with bcrypt - never stored plain text

---

## Monitoring & Support

### Railway Dashboard
- View logs: Dashboard → Logs tab
- Monitor metrics: Performance tab
- Manage variables: Variables tab

### Vercel Dashboard
- View logs: Project → Deployments → Logs
- Monitor analytics: Analytics tab
- Manage env vars: Settings → Environment Variables

---

## Next Steps After Deployment

1. Test your deployment with real data
2. Set up automated backups for MongoDB
3. Monitor error logs regularly
4. Update FRONTEND_URL in backend if your frontend domain changes
5. Keep dependencies updated for security patches

