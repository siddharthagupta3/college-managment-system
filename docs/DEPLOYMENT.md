# CMS Full Stack Deployment Guide (Node + MongoDB)

## 1. Environment variables

Backend (`backend/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cms
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://your-frontend-domain.com

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

