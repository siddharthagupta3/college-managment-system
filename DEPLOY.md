# CMS – Render deploy (short)

## 1. MongoDB Atlas
- [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster → Database Access (add user) → Network Access → Add IP `0.0.0.0/0`
- Connect → **Drivers** → copy connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/cms`)

## 2. Backend (Render)
- [render.com](https://render.com) → **New** → **Web Service** → connect this repo
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Add  
  `MONGODB_URI` = Atlas connection string  
  `JWT_SECRET` = any long random string  
  `CORS_ORIGINS` = `https://YOUR-FRONTEND-URL` (add after step 3)  
  `FRONTEND_URL` = same as CORS_ORIGINS  
- Deploy → copy backend URL (e.g. `https://cms-api.onrender.com`)

## 3. Frontend (Render)
- **New** → **Static Site** → same repo
- **Publish directory:** `frontend`
- Deploy → copy frontend URL (e.g. `https://cms-web.onrender.com`)

## 4. Connect
- Backend service → **Environment** → set  
  `CORS_ORIGINS` = `https://cms-web.onrender.com`  
  `FRONTEND_URL` = `https://cms-web.onrender.com`  
  (use your real frontend URL)
- In repo: **frontend/index.html** and **frontend/signup/singup.html** → in `<html>` add  
  `data-api-base="https://YOUR-BACKEND-URL.onrender.com/api"`  
  Example: `<html lang="en" data-api-base="https://cms-api.onrender.com/api">`
- Commit & push → frontend will redeploy and use the API.

Done. Login/Signup at `https://YOUR-FRONTEND-URL/signup/singup.html`
