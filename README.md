# Horizon Travel Planner

A full-stack AI-powered travel planning application built with **Next.js 16**, **Supabase (PostgreSQL)**, **Prisma ORM**, **NextAuth**, and **Google Gemini AI**.

---

## ✨ Features

| Module | Description |
|---|---|
| 🗺️ **Trip Planner** | Create, manage, and track trips with destinations, budgets & dates |
| 🤖 **AI Itinerary** | Gemini-powered day-by-day itinerary generation |
| 📸 **Photo Gallery** | Upload & organize travel photos via Cloudinary |
| 📖 **Travel Stories** | Write and publish user-generated travel stories |
| 💰 **Budget Tracker** | Expense tracking with category breakdown charts |
| 💱 **Currency Converter** | Live exchange rates via Frankfurter ECB API |
| 🌤️ **Weather Widget** | Real-time weather for any destination |
| 🗺️ **Interactive Map** | Route and destination visualization with Leaflet |
| ❤️ **Wishlist** | Save dream destinations with priority levels |
| 👤 **Profile Manager** | User profile with avatar upload support |
| 👑 **Admin Panel** | Centralized dashboard for user administration, trip management, destination settings, story moderation, system health monitoring, and analytics |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 7
- **Auth**: NextAuth v4 (credentials)
- **AI**: Google Gemini (`@google/genai`)
- **Media**: Cloudinary (with local fallback)
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Styling**: Tailwind CSS v4 + ShadCN UI

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/MalshaJayamanne/travel-planner
cd travel-planner
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see the example file for details).

### 3. Set Up the Database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Cloudinary Setup (Photo Gallery)

The photo gallery supports Cloudinary for production-grade image storage. Without it, photos are saved locally to `public/uploads/` (development only).

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Navigate to **Dashboard → API Keys**
3. Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🌐 Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: Week 4 — finalization & deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Framework Preset** to `Next.js`

### 3. Add Environment Variables

In the Vercel dashboard → **Settings → Environment Variables**, add all variables from `.env.example`:

| Variable | Required |
|---|---|
| `DATABASE_URL` | ✅ Yes |
| `DIRECT_URL` | ✅ Yes |
| `NEXTAUTH_SECRET` | ✅ Yes |
| `NEXTAUTH_URL` | ✅ Yes (set to your Vercel domain) |
| `JWT_SECRET` | ✅ Yes |
| `GEMINI_API_KEY` | ✅ Yes |
| `OPENWEATHER_API_KEY` | ✅ Yes |
| `CLOUDINARY_CLOUD_NAME` | ⚡ Recommended |
| `CLOUDINARY_API_KEY` | ⚡ Recommended |
| `CLOUDINARY_API_SECRET` | ⚡ Recommended |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional |

> ⚠️ **Important**: Set `NEXTAUTH_URL` to your actual Vercel domain (e.g. `https://travel-planner-xyz.vercel.app`)

### 4. Run Database Migrations on Vercel

After first deploy, run migrations using the Vercel CLI or Vercel's **Post Build Command**:

```
npx prisma migrate deploy
```

### 5. Deploy

Click **Deploy** — Vercel will build and deploy your application automatically on every `git push`.

---

## 📁 Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── api/               # API route handlers
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── trips/         # Trip CRUD
│   │   ├── photos/        # Cloudinary photo upload
│   │   ├── stories/       # Travel stories CRUD
│   │   ├── currency/      # Currency conversion APIs
│   │   ├── weather/       # Weather API proxy
│   │   └── wishlist/      # Wishlist management
│   ├── dashboard/         # Main dashboard
│   ├── trips/             # Trip planner page
│   ├── gallery/           # Photo gallery
│   ├── stories/           # Travel stories
│   ├── budget/            # Budget tracker
│   ├── currency/          # Currency converter
│   ├── wishlist/          # Wishlist page
│   ├── explore/           # Explore destinations
│   └── profile/           # User profile
├── components/            # Reusable React components
├── lib/                   # Auth, Prisma, utilities
├── services/              # External API services
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
prisma/
└── schema.prisma          # Database schema
```

---

## 🏆 System Roles

### 👤 Traveler (Default User)
- **Authentication**: Register, login, and manage profile
- **Trips**: Create and manage trips, view itineraries
- **AI Integration**: Generate AI itineraries based on preferences
- **Wishlist & Savings**: Save trips and manage dream destinations
- **Community**: Post and share travel stories

### 👑 Administrator
- **User Management**: View, search, enable/disable, and delete user accounts
- **Trip Management**: View all trips, inspect AI itineraries, delete inappropriate content
- **Content Moderation**: Manage destination database and categories; moderate travel stories
- **System Monitoring**: Access API health, error logs, AI request usage, and database status
- **Feedback & Support**: View user feedback, manage contact requests, and export reports

---

## 👥 Team

| Developer | Role | Weeks |
|---|---|---|
| Developer 1 (Main) | Frontend, AI, Maps, Gallery, Stories, Deployment, Admin Dashboard | Weeks 1–5 |
| Developer 2 (Support) | Backend, Auth, Wishlist, Currency, QA, Docs, Content Moderation & Monitoring | Weeks 1–5 |

---

## 📄 License

MIT
