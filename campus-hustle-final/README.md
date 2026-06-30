# HustleGrad

HustleGrad is a campus student marketplace web application for buying, selling, booking, and messaging around student-run products and services. It is designed for a polished campus demo with localized pickup zones, seller metrics, profile pictures, and a mock M-PESA escrow checkout flow.

## Features

- Student registration with unique 6 to 8 digit school-issued admission numbers and flexible personal or Strathmore email OTP login
- Persistent sessions with server-side token revalidation
- Protected student, admin, messaging, and seller dashboard routes
- Marketplace search and category filtering
- Campus Zone tagging for listings:
  - Student Centre (STC)
  - Phase 2
  - The Library Gates
  - The Cafeteria/Gazebos
- Profile picture upload with public image URL persistence
- Listing creation and seller dashboard metrics
- Buyer/seller messaging
- Booking requests and reviews
- High-fidelity mock M-PESA STK Push checkout with escrow success screen
- Admin overview for users and listings

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router, Axios, CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT, bcrypt, admission-number login, email OTP |
| Email | Nodemailer |
| Security | Helmet, CORS, rate limiting |

## Project Structure

```text
campus-hustle-final/
  backend/
    config/
    controllers/
    middleware/
    routes/
    services/
    utils/
    schema.sql
    server.js
  frontend/
    public/
    src/
      api/
      components/
      context/
      hooks/
      styles/
  ARCHITECTURE.md
  README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL
- A Gmail app password or SMTP credentials for 2FA emails

## Environment Variables

Create `backend/.env` with:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/campus_marketplace
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
PUBLIC_BASE_URL=http://localhost:5000
```

Optional storage settings:

```env
UPLOAD_DIR=public/uploads
PROFILE_PICTURE_BUCKET=profile-pictures
```

## Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Initialize the database from the backend folder:

```bash
npm run db:init
```

Warning: `schema.sql` drops and recreates the demo tables. Only run it when you are ready to reset the local database.

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm start
```

Open:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/health`


## Build and Verification

Build the frontend:

```bash
cd frontend
npm run build
```

Check backend JavaScript syntax:

```bash
cd backend
Get-ChildItem -Recurse -Filter *.js -File | Where-Object { $_.FullName -notlike '*node_modules*' } | ForEach-Object { node --check $_.FullName }
```

## Launch Notes

- Rotate any local secrets before deploying.
- Keep `.env` files out of version control.
- For production storage, replace local profile image storage with Supabase Storage or S3 using the same service boundary.
- For production auth, prefer short-lived access tokens plus refresh tokens.
- Add pagination before high-traffic marketplace use.
- See `ARCHITECTURE.md` for the Clean Architecture diagnosis and refactoring roadmap.
