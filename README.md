# 🎯 YT-GENAI — AI-Powered Interview Preparation Platform

A full-stack web application that helps job seekers prepare for interviews using AI. Upload your resume and paste a job description — the AI generates a personalized interview report with technical questions, behavioral questions, skill gaps, preparation plan, and an AI-generated resume PDF.

---

## ✨ Features

- 📄 **Resume Analysis** — Upload your resume (PDF) and get AI-powered insights
- 🎯 **Match Score** — See how well your profile matches the job description
- ❓ **Technical Questions** — AI-generated technical interview questions with answers
- 🧠 **Behavioral Questions** — Behavioral questions with intentions and model answers
- 📊 **Skill Gap Analysis** — Identify missing skills with severity levels
- 🗓️ **Preparation Roadmap** — Day-wise personalized preparation plan
- 📥 **AI Resume PDF** — Download an AI-generated professional resume as PDF
- 🔐 **Authentication** — Secure JWT-based login/register system
- 📁 **Report History** — View all your previously generated interview reports

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js + Vite | Frontend framework |
| React Router DOM | Client-side routing |
| Context API + Custom Hooks | State management |
| Axios | HTTP requests |
| SCSS | Custom dark theme styling |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | Backend framework (MVC) |
| MongoDB + Mongoose | Database + ODM |
| JWT + HttpOnly Cookies | Authentication |
| bcryptjs | Password hashing |
| Multer | PDF file upload |
| pdf-parse | Extract text from PDF |
| Puppeteer | HTML to PDF generation |
| Mistral AI | AI report + resume generation |
| Zod | AI response schema validation |

---

## 📁 Project Structure

```
YT-GENAI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controller/
│   │   │   ├── auth.controller.js
│   │   │   └── interview.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── file.middleware.js
│   │   ├── models/
│   │   │   ├── blacklist.model.js
│   │   │   ├── interviewReport.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── interview.routes.js
│   │   ├── services/
│   │   │   └── ai.services.js
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   └── protected.jsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.js
│   │   │   │   ├── pages/
│   │   │   │   │   ├── Login.jsx
│   │   │   │   │   └── Register.jsx
│   │   │   │   ├── AuthContext.js
│   │   │   │   ├── auth.context.jsx
│   │   │   │   └── auth.form.scss
│   │   │   └── interview/
│   │   │       ├── hooks/
│   │   │       │   └── useInterview.js
│   │   │       ├── pages/
│   │   │       │   ├── Home.jsx
│   │   │       │   └── interview.jsx
│   │   │       ├── style/
│   │   │       │   ├── home.scss
│   │   │       │   └── interview.scss
│   │   │       ├── interview.context.js
│   │   │       └── interview.provider.jsx
│   │   ├── pages/
│   │   │   └── ErrorPage.jsx
│   │   ├── services/
│   │   │   ├── auth.api.js
│   │   │   └── interview.api.js
│   │   ├── App.jsx
│   │   ├── app.routes.jsx
│   │   ├── main.jsx
│   │   └── style.scss
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Mistral AI API Key

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YT-GENAI.git
cd YT-GENAI
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
MISTRAL_API_KEY=your_mistral_api_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

Backend will run on **http://localhost:3000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `MISTRAL_API_KEY` | Mistral AI API key |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS |

---

## 📡 API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/get-me` | Get current user |

### Interview Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/` | Generate interview report |
| GET | `/api/interview/` | Get all reports |
| GET | `/api/interview/report/:id` | Get single report |
| POST | `/api/interview/resume/pdf/:id` | Download AI resume PDF |

---

## 🔐 Security Features

- JWT stored in `httpOnly` cookies (XSS safe)
- `sameSite: strict` cookies (CSRF safe)
- Token blacklisting on logout
- TTL index auto-deletes expired blacklisted tokens
- Password hashing with bcryptjs (salt rounds: 10)
- File upload restricted to PDF only (max 3MB)
- Input validation on all routes

---

## 🤖 How AI Works

1. User uploads resume PDF → `pdf-parse` extracts text
2. Text + job description sent to **Mistral AI**
3. Mistral returns structured JSON (validated with **Zod**)
4. Report saved to MongoDB and shown to user
5. For PDF download → Mistral generates HTML resume → **Puppeteer** converts to PDF

---

## 👨‍💻 Author

**Ravi Ranjan Kumar**
- GitHub: [@raviranjan1108](https://github.com/raviranjan1108)
- LinkedIn: [linkedin.com/in/raviranjan56](https://linkedin.com/in/raviranjan56)
