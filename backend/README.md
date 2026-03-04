# CMS Backend (Node.js + Express + MongoDB)

This backend provides:
- Role-based signup/login (**admin**, **faculty**, **student**) using **bcrypt + JWT**
- **Group chat** (WhatsApp-like) using REST + **Socket.IO**
- **Admin/Faculty permissions** for group management + sending messages
- **Student permissions**: view messages, react to messages, personal profile APIs
- **Notifications** for new messages (REST + Socket.IO)

---

## Folder structure

```
backend/
  server.js
  .env
  .env.example
  package.json
  src/
    app.js
    config/
      db.js
    controllers/
      authController.js
      groupController.js
      messageController.js
      notificationController.js
      userController.js
    middleware/
      auth.js
    models/
      Group.js
      Message.js
      Notification.js
      User.js
    routes/
      authRoutes.js
      groupRoutes.js
      messageRoutes.js
      notificationRoutes.js
      userRoutes.js
    sockets/
      index.js
      io.js
```

---

## Setup & Run

1. Start MongoDB locally (default URI is in `.env`).
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run the server:

```bash
npm run dev
# or
npm start
```

Server starts on `http://localhost:5000`.

---

## Authentication

- **Auth header** (required for all protected endpoints):
  - `Authorization: Bearer <JWT_TOKEN>`
- Store the JWT token in `localStorage` on the frontend.

---

## API Routes (REST)

### Auth
- `POST /api/auth/signup`
  - Body: `{ "name": "...", "email": "...", "password": "...", "role": "admin|faculty|student" }`
- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` (protected)

### Users / Profile (Instagram-like profile page)
- `GET /api/users/me` (protected)
- `PATCH /api/users/me` (protected)
  - Body example:
    - `{ "name": "New Name", "profile": { "bio": "Hello", "avatarUrl": "...", "department": "...", "year": "..." } }`
- `GET /api/users/:userId` (protected, returns public profile fields)

### Groups (WhatsApp-like groups)
- `GET /api/groups` (protected) — list groups where you are a member
- `POST /api/groups` (protected, **admin/faculty**)
  - Body: `{ "name": "Group Name", "memberIds": ["<userId>", "..."] }`
- `GET /api/groups/:groupId` (protected, must be member)

#### Group members
- `POST /api/groups/:groupId/members` (protected, **admin/faculty**, must be member)
  - Body: `{ "userId": "<userId>" }`
- `DELETE /api/groups/:groupId/members` (protected, **admin/faculty**, must be member)
  - Body: `{ "userId": "<userId>" }`
  - Rule: **Faculty cannot remove an admin user**

### Messages
- `GET /api/messages/group/:groupId` (protected, must be member)
- `POST /api/messages/group/:groupId` (protected, **admin/faculty**, must be member)
  - Body: `{ "text": "Hello!" }`

### Reactions (student)
- `POST /api/messages/:messageId/react` (protected, **student**)
  - Body: `{ "emoji": "👍" }`

### Notifications
- `GET /api/notifications?unread=true&limit=50` (protected)
- `POST /api/notifications/read-all` (protected)

---

## Real-time (Socket.IO)

### Client connect

Include Socket.IO client in your HTML (CDN):

```html
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
```

Connect using JWT:

```js
const token = localStorage.getItem("token");
const socket = io("http://localhost:5000", { auth: { token } });
```

### Join a group room

```js
socket.emit("join:group", { groupId });
```

### Listen for new messages + notifications

```js
socket.on("message:new", (message) => {
  // update chat UI
});

socket.on("notification:new", (n) => {
  // show badge / toast / increment counter
});
```

---

## Connect backend with your existing HTML/CSS/JS frontend

### 1) Set CORS for your frontend origin

If you use Live Server (commonly `http://127.0.0.1:5500` or `http://localhost:5500`), set:

```
CORS_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
```

in `backend/.env`, then restart backend.

### 2) Frontend `fetch()` helper

```js
const API_BASE = "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

### 3) Signup (for Admin/Faculty/Student)

```js
async function signup({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  localStorage.setItem("token", data.token);
  return data.user;
}
```

### 4) Login

```js
async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  localStorage.setItem("token", data.token);
  return data.user;
}
```

### 5) Load groups + messages

```js
async function listGroups() {
  const res = await fetch(`${API_BASE}/groups`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load groups");
  return data.groups;
}

async function loadMessages(groupId) {
  const res = await fetch(`${API_BASE}/messages/group/${groupId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load messages");
  return data.messages;
}
```

### 6) Send message (Admin/Faculty only)

```js
async function sendMessage(groupId, text) {
  const res = await fetch(`${API_BASE}/messages/group/${groupId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send");
  return data.message;
}
```

