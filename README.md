# TPEML HR Recruitment Portal

HR Recruitment Portal for **Tata Passenger Electric Mobility Limited (TPEML)**. Digitizes recruitment while keeping **Microsoft Forms** as the system of record and **Excel** as the primary reporting format.

## Tech Stack

- **Frontend:** React (Vite), functional components
- **Backend:** Python, FastAPI
- **Database:** MongoDB
- **Auth:** JWT, RBAC (Admin, HR, Interviewer)
- **Reports:** Excel (.xlsx) export
- **QR:** Generation and scanning support

## Project Structure

```
tpem_project/
├── backend/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Env-based config
│   ├── database.py       # MongoDB connection
│   ├── init_db.py        # Create indexes + seed admin
│   ├── auth/             # JWT, RBAC
│   ├── models/           # MongoDB document schemas
│   ├── routers/          # API routes
│   ├── services/         # Business logic (QR, Excel, Forms sync)
│   ├── utils/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── auth/
│   │   └── styles/
│   └── package.json
└── README.md
```

## Setup

### 1. MongoDB

Install MongoDB and start the service:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Copy `env.example` to `.env` and set:

- `MONGODB_URI=mongodb://localhost:27017` (or your MongoDB connection string)
- `MONGODB_DB=tpeml_recruitment`
- `JWT_SECRET_KEY` (use a strong secret in production)

Initialize DB (creates indexes) and seed admin:

```bash
python init_db.py
```

Run API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` and `/static` to the backend.

### 4. Login

- **Email:** `admin@tpeml.com`
- **Password:** `Admin@123`

### 5. Create Additional Users

To create additional users (HR, recruiters), use the user creation script:

```bash
cd backend
python create_user.py
```

The script will prompt you for:
- Email address
- Full name
- Role (admin, hr, or recruiter)
- Password (minimum 8 characters)

Alternatively, you can create users directly in MongoDB.

## Features

- **Candidate entry:** MS Forms integration (sync via `POST /api/sync/forms`). Manual create via "Add Candidate" (HR/Admin).
- **Candidate search:** By ID, QR, or name/email.
- **Yet-to-interview:** List, filter, add notes, submit decision (Shortlist / Reject / Hold). Moves candidate to Interview Completed.
- **Interview completed:** Read-only list with filters (date, role, decision).
- **Reports:** Excel download for Daily Log, Interview Results, Audit Logs (HR/Admin; Audit Admin only).
- **Re-interview:** HR/Interviewer request; Admin approve/reject.

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (JSON: email, password) |
| GET | `/api/auth/me` | Current user (Bearer) |
| POST | `/api/auth/seed` | Seed user (dev) |
| GET | `/api/candidates/search?q=` | Search candidates |
| GET | `/api/candidates/id/{id}` | Get by candidate ID |
| POST | `/api/candidates` | Create candidate (HR/Admin) |
| GET | `/api/interviews/yet-to-interview` | YTI list |
| POST | `/api/interviews/submit` | Submit interview |
| GET | `/api/interviews/completed` | Completed list |
| GET | `/api/reports/daily-log` | Excel daily log |
| GET | `/api/reports/interview-results` | Excel interview results |
| GET | `/api/reports/audit-logs` | Excel audit (Admin) |
| POST | `/api/re-interview/request` | Request re-interview |
| POST | `/api/re-interview/resolve` | Approve/reject (Admin) |
| GET | `/api/re-interview/pending` | Pending requests (Admin) |
| GET | `/api/qr/{candidate_id}` | QR PNG |

## External form integrations

MS Forms integration has been removed. Create candidates via the API endpoint `POST /api/candidates` (HR/Admin) or via the frontend manual entry form. Candidate IDs and QR generation remain part of the backend workflow.

## Security

- JWT auth; no sensitive data in frontend.
- Role-based route and API checks.
- Use `.env` for secrets; never commit them.

## License

Internal use – Tata Passenger Electric Mobility Limited.
