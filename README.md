# Travel Planner

A Next.js travel planning application focused on trip management, budget tracking, AI-assisted itinerary ideas, and travel insights.

## Project Overview
This project is being developed as a full travel planner with:
- trip creation and management
- budget and expense tracking
- wishlist support
- AI itinerary generation
- maps, weather, and currency integration
- photo gallery and travel story features

## Recommended Monorepo Structure

```text
travel-planner/
├── frontend/          # Next.js UI
├── backend/           # API + services
├── prisma/            # Database schema
├── shared/            # Shared types, constants, utils
├── .env
└── README.md
```

### Frontend Structure

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── dashboard/
│   ├── trips/
│   ├── expenses/
│   └── auth/
├── components/
├── hooks/
├── store/
├── styles/
└── lib/
```

### Backend Structure

```text
backend/
├── controllers/
├── routes/
├── services/
├── middlewares/
└── utils/
```

### Shared Module

```text
shared/
├── types/
├── constants/
└── utils/
```

### System Flow

```text
Frontend (Next.js)
      ↓
Backend (API Layer)
      ↓
Services (AI, Maps, Weather, Currency)
      ↓
Prisma ORM
      ↓
PostgreSQL Database
```

## Documentation
- [requirements.md](requirements.md) — project requirements and scope
- [work.md](work.md) — split development plan by week

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Tech Stack
- Next.js
- TypeScript
- Tailwind CSS
- ShadCN UI
- Prisma
- PostgreSQL
- NextAuth

## Planned Features
- Dashboard and travel planning interface
- Trip CRUD and budget analytics
- Expense tracking and charts
- AI itinerary generator
- Maps, weather, and currency support
- Cloudinary photo gallery and travel stories

## Deployment
The final application is planned for deployment on Vercel.
