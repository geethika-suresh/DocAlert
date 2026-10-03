# DocAlert — Document Reminder

> **Student-Focused Document Management & Expiry Tracking Web Application**  
> Final Year CSE Project · MERN Stack · 100% Free · No Paid Services

---

## 📋 SRS Summary

DocAlert is a browser-based web application that helps students organise important documents (passports, ID cards, certificates, insurance), track issue and expiry dates, monitor document status, and receive timely expiry reminders.

**Architecture:** React SPA + Node/Express API + MongoDB Atlas (free tier) + LocalStorage/IndexedDB fallback  
**Deployment:** Client → Vercel | Server → Render (free tier)  
**Storage:** LocalStorage (records) + IndexedDB (attachments)  
**AI Layer:** Rule-based category suggester — no API key, no paid AI

---

## 🎯 SRS Traceability Table

| SRS Requirement ID | Requirement Name        | Implemented As              | API Endpoint                        | Page / Component          |
|--------------------|-------------------------|-----------------------------|-------------------------------------|---------------------------|
| FR1                | Add Document            | `AddDocumentPage.jsx`       | `POST /api/documents`               | `/documents/add`          |
| FR2                | Document Dashboard      | `DashboardPage.jsx`, `DocumentsPage.jsx` | `GET /api/documents`   | `/dashboard`, `/documents`|
| FR3                | Expiry Reminders        | `RemindersPage.jsx`, `ReminderPanel.jsx` | `GET /api/documents/reminders` | `/reminders`    |
| FR4                | Search & Filter         | `SearchPage.jsx`, `SearchFilterBar.jsx`  | `GET /api/documents?search=&category=` | `/search` |
| FR5                | Document Details        | `DocumentDetailsPage.jsx`   | `GET /api/documents/:id`            | `/documents/:id`          |
| FR5 (attachment)   | File Attachment         | `DocumentDetailsPage.jsx`   | `PUT /api/documents/:id/attachment` | `/documents/:id`          |
| NFR1               | Security / Validation   | `authMiddleware.js`, form validation | All routes                 | All forms                 |
| NFR2               | Scalability             | Modular services, StorageAdapter | —                             | —                         |
| NFR3               | Reliability             | `errorHandler.js`, localStorage fallback | —                    | All pages                 |
| NFR4               | Maintainability         | Separated UI/services/context | —                               | —                         |
| NFR5               | Usability               | Toast notifications, empty states, validation messages | —      | All pages                 |
| NFR6               | Privacy                 | Data in browser, delete anytime | All routes                   | All pages                 |
| IR1                | User Interface          | Responsive Tailwind UI      | —                                   | All pages                 |
| IR2                | Software Interface      | LocalStorage, IndexedDB, Notification API | —                    | Context + services        |
| SRS §7.3           | Optional Category AI    | `aiService.js` rule-based   | —                                   | `AddDocumentPage`         |

---

## ✨ 5 Core Features

1. **FR1 – Add Document** — Name, category, issue date, expiry date with full validation. AI category suggestion.
2. **FR2 – Document Dashboard** — All documents with Active / Expiring Soon / Expired status + summary counts + charts.
3. **FR3 – Expiry Reminders** — Configurable 7/15/30 day window, reminder banners, optional browser notifications.
4. **FR4 – Search & Filter** — Instant name search + category filter + status filter, no page reload.
5. **FR5 – Document Details** — Full document view, edit, delete, and file/photo attachment (IndexedDB).

---

## 🛠 Tech Stack

| Layer        | Technology                                   | Cost       |
|--------------|----------------------------------------------|------------|
| Frontend     | React 18 + Vite + Tailwind CSS               | Free       |
| Routing      | React Router v6                              | Free       |
| Charts       | Recharts                                     | Free       |
| Icons        | Lucide React                                 | Free       |
| HTTP Client  | Axios                                        | Free       |
| Toasts       | React Hot Toast                              | Free       |
| Backend      | Node.js + Express.js                         | Free       |
| Auth         | JWT + bcryptjs                               | Free       |
| Database     | MongoDB Atlas (free tier) / localStorage     | Free       |
| Deployment   | Vercel (client) + Render (server)            | Free tier  |
| AI           | Rule-based (no API key)                      | Free       |

---

## 📁 Project Structure

```
DocAlert/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── DocAlertLogo.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── DocumentCard.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── ReminderPanel.jsx
│   │   │   ├── SearchFilterBar.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/              # Route pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx       ← First page (SRS requirement)
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx   ← FR2
│   │   │   ├── DocumentsPage.jsx   ← FR2 + FR4
│   │   │   ├── AddDocumentPage.jsx ← FR1
│   │   │   ├── DocumentDetailsPage.jsx ← FR5
│   │   │   ├── RemindersPage.jsx   ← FR3
│   │   │   ├── SearchPage.jsx      ← FR4
│   │   │   └── HelpPage.jsx
│   │   ├── services/
│   │   │   ├── api.js              ← Axios instance
│   │   │   ├── aiService.js        ← Rule-based AI (no API key)
│   │   │   └── localStorageService.js ← Browser storage + IndexedDB
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── DocumentContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Node + Express backend
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── documents.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── documentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── config/
│   │   └── db.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── package.json                # Root scripts
└── README.md
```

---

## 🗃 Data Models

### User
```json
{ "name": "string", "email": "string (unique)", "password": "hashed string" }
```

### Document
```json
{
  "userId": "ObjectId (FK)",
  "name": "string",
  "category": "Identity Document | Certificate | Insurance | Government ID | Other",
  "issueDate": "Date",
  "expiryDate": "Date",
  "notes": "string (optional)",
  "attachment": { "fileName": "string", "mimeType": "string", "sizeBytes": "number" }
}
```
> Status is **derived** from dates at runtime — never stored (SRS §5.1)

---

## 🔌 API Endpoints

| Method | Endpoint                           | Auth | Description                    |
|--------|------------------------------------|------|--------------------------------|
| POST   | `/api/auth/register`               | No   | Register new user              |
| POST   | `/api/auth/login`                  | No   | Login + get JWT token          |
| GET    | `/api/auth/me`                     | Yes  | Get current user               |
| GET    | `/api/documents`                   | Yes  | Get all docs (search/filter)   |
| POST   | `/api/documents`                   | Yes  | Add new document (FR1)         |
| GET    | `/api/documents/reminders`         | Yes  | Get expiring docs (FR3)        |
| GET    | `/api/documents/:id`               | Yes  | Get document details (FR5)     |
| PUT    | `/api/documents/:id`               | Yes  | Update document                |
| DELETE | `/api/documents/:id`               | Yes  | Delete document                |
| PUT    | `/api/documents/:id/attachment`    | Yes  | Add/update attachment (FR5)    |
| DELETE | `/api/documents/:id/attachment`    | Yes  | Remove attachment              |

---

## 🤖 How Mock AI Works

`client/src/services/aiService.js` — **No API key required, no paid service**

- `suggestCategory(name)` — Keyword rules match document name → returns category + confidence
- `analyseDocuments(docs)` — Returns insights, risk score, recommendations
- `getRenewalTips(category)` — Returns category-specific renewal advice
- 800ms delay simulates AI response time (as per SRS requirement)

Example:
```js
await suggestCategory("Passport")
// → { suggestedCategory: "Identity Document", confidence: "high", matchedKeyword: "passport" }
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ and npm

### 1. Clone / open the project
```bash
cd DocAlert
```

### 2. Install all dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment

**server/.env** (create from `.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri    # Leave blank for in-memory demo mode
JWT_SECRET=your_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

**client/.env** (create from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start both servers

Terminal 1 (server):
```bash
cd server
npm run dev
```

Terminal 2 (client):
```bash
cd client
npm run dev
```

Open: http://localhost:5173

> **Demo mode:** If no `MONGO_URI` is set, the server runs without a database.  
> The client will automatically fall back to LocalStorage for full offline functionality.

---

## ☁️ Deploy to Vercel & Render

### Client → Vercel
1. Push `client/` folder to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set `VITE_API_URL=https://your-render-server.onrender.com/api`
4. Deploy

### Server → Render (free tier)
1. Push `server/` folder to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

---

## ✅ No API Key Needed

| Component               | Cost   | API Key? |
|-------------------------|--------|----------|
| React + npm packages    | Free   | No       |
| Node.js + Express       | Free   | No       |
| LocalStorage/IndexedDB  | Free   | No       |
| MongoDB Atlas free tier | Free   | No (URI only) |
| Rule-based AI           | Free   | No       |
| GitHub repository       | Free   | No       |
| Vercel hosting          | Free   | No       |
| Render hosting          | Free   | No       |

---

© 2026 DocAlert — Final Year CSE Project
