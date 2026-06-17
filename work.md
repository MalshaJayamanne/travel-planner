# Split Work Plan

## Week 1 — Setup & Foundation

### Developer 1 (Main)

#### Frontend + Project Structure
- [x] Create Next.js project
- [x] Setup folder structure
- [x] Tailwind + ShadCN setup
- [x] Dashboard layout UI
- [x] Navbar + Sidebar
- [x] Basic pages setup

### Developer 2 (Support)

#### Backend + Infrastructure
- [x] PostgreSQL setup
- [x] Prisma setup
- [x] Database schema
- [x] Prisma migrations
- [x] NextAuth setup
- [x] Authentication backend + login UI

## Week 2 — Core Travel Features

### Developer 1 (Main)

#### Trip + Preferences Modules
- [x] Trip Planner frontend
- [x] Trip CRUD backend
- [x] Travel Preferences UI
- [x] Preferences API
- [x] Budget calculator
- [x] Basic dashboard view

### Developer 2 (Support)

#### Supporting Features
- [x] Wishlist frontend + backend
- [x] Wishlist APIs
- [x] UI component support
- [x] Form validation + styling

## Week 3 — Smart Features & Integrations

### Developer 1 (Main)

#### AI + Maps + APIs
- [x] AI itinerary generator
- [x] Gemini/OpenAI integration
- [x] Prompt engineering
- [x] Maps integration
- [x] Route display
- [x] Weather integration

### Developer 2 (Support)

#### Utilities + Assistance
- [x] Currency converter frontend (`currency-converter.tsx`)
- [x] Currency API backend (`/api/currency/convert`, `/api/currency/rates`)
- [x] Currency service (`services/currency.ts` — Frankfurter ECB API)
- [x] Currency widget (`currency-widget.tsx` — live compact rates)
- [x] Currency page (`/currency` — full-page converter)
- [x] Assist API testing (weather + currency APIs validated)
- [x] Enhanced weather widget (feelsLike, humidity, wind, dynamic gradients)
- [x] Currency widget embedded in Dashboard + Budget pages
- [x] Currency nav item added to sidebar

## Week 4 — Finalization & Deployment

### Developer 1 (Main)

#### Final Product Completion
- [x] Photo gallery + Cloudinary (`/gallery`, `/api/photos` — Cloudinary + local fallback)
- [x] Travel stories module (`/stories`, `/api/stories` — CRUD with cover images)
- [x] Final UI polish (responsive grid, lightbox, masonry layout, animations)
- [x] Full integration (Gallery linked to sidebar, Stories in top nav + sidebar)
- [x] Deployment (Vercel — README + env setup complete)
- [x] Final bug fixing (active nav state fix, image domain config, nav consistency)

### Developer 2 (Support)

#### Quality + Documentation
- [x] Testing (API routes validated: photos, stories, auth, currency, weather)
- [x] Bug fixing support (sidebar active state, route handlers, env config)
- [x] README + documentation (full setup, Cloudinary, Vercel deployment guide)
- [x] Setup guide (`.env.example` updated with all vars including Cloudinary)
- [x] Deployment assistance (next.config.ts updated with image domains)
- [x] Final QA testing (build config verified, gallery + stories end-to-end)
