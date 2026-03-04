# CMS Full Stack Deployment Guide (Node + MongoDB)

---

## Deploy on Render (short steps)

### 1. Database (MongoDB Atlas)
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Create a database user and allow access from anywhere (0.0.0.0/0). Copy the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/cms`).

### 2. Backend on Render
- Dashboard → **New** → **Web Service**. Connect your repo.
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Add:
  - `MONGODB_URI` = your Atlas connection string
  - `JWT_SECRET` = long random string (or use Generate)
  - `CORS_ORIGINS` = your frontend URL (e.g. `https://cms-web.onrender.com`)
  - `FRONTEND_URL` = same frontend URL (for email verification/reset links)
  - `SMTP_USER` / `SMTP_PASS` = Gmail app password (for verification & forgot password emails)
- Deploy. Note the backend URL (e.g. `https://cms-api.onrender.com`).

### 3. Frontend on Render
- **New** → **Static Site**. Connect same repo.
- **Publish directory:** `frontend`
- After first deploy, open **frontend/index.html** and add to the `<html>` tag:
  `data-api-base="https://cms-api.onrender.com/api"` (use your backend URL).
- Do the same in **frontend/signup/singup.html** (same `data-api-base`).
- Redeploy the static site so both pages use the backend API.

### 4. Connect frontend to backend
So the frontend knows the API URL, either:
- **Option A:** In **frontend/index.html** and **frontend/signup/singup.html**, set:
  `<html lang="en" data-api-base="https://YOUR-BACKEND.onrender.com/api">`
- **Option B:** Or in **frontend/config.js** change the fallback to your backend URL for production.

---

## 1. Environment variables (reference)

Backend (`backend/.env` or Render env):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cms
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Email (Gmail app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app_password

# Optional: Gemini AI
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-1.5-flash
```

## 2. Build & run backend (production)

On your server:

```bash
cd backend
npm install
NODE_ENV=production node server.js
```

Use a process manager like **pm2** or a systemd service to keep it running.

Expose `PORT` 5000 (or change it in `.env` and your reverse proxy).

## 3. Frontend hosting

The `frontend/` folder is static HTML/CSS/JS.

You can:

- Serve it from **Nginx / Apache** as static files, or
- Upload it to services like **Netlify**, **Vercel static**, or any static host.

Update API base URLs in:

- `frontend/signup/signup.js`
- `frontend/admindashboard/admin.js`
- `frontend/admindashboard/ai-chat.js`

Change:

```js
const API_BASE = "http://localhost:5000/api";
```

to your production backend URL, e.g.:

```js
const API_BASE = "https://api.your-domain.com/api";
```

## 4. MongoDB in production

Options:

- Use **MongoDB Atlas** (cloud-hosted)
- Or host your own MongoDB instance (Docker or bare metal)

Update `MONGODB_URI` in `.env` accordingly.

## 5. SSL and reverse proxy

Use **Nginx** or **Caddy** in front of Node:

- Terminate HTTPS on Nginx/Caddy
- Proxy `/api` and Socket.IO (`/socket.io`) to the Node backend

Example Nginx `location` blocks:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:5000/api/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}

location /socket.io/ {
  proxy_pass http://127.0.0.1:5000/socket.io/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```

