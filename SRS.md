# Software Requirements Specification (SRS)
## AI Travel Planner Web Application

---

# 1. Introduction

## 1.1 Purpose
The purpose of this document is to define the software requirements for the **AI Travel Planner Web Application**, a smart travel planning system that helps users generate personalized travel itineraries using artificial intelligence. The system is built using **Next.js**, **Supabase**, and **Prisma ORM**, with integration of AI-based recommendation services.

This SRS describes the functional and non-functional requirements, system architecture, database design, and external interfaces required to implement the system.

## 1.2 Scope
The AI Travel Planner is a web-based application that allows users to:
- Register and authenticate securely
- Create and manage travel profiles
- Generate AI-based travel itineraries
- Search destinations and activities
- Save and manage travel plans
- Receive personalized travel recommendations

The system is designed for individual travelers who want automated trip planning assistance.

## 1.3 Definitions, Acronyms, Abbreviations
- **AI** – Artificial Intelligence  
- **API** – Application Programming Interface  
- **DB** – Database  
- **ORM** – Object Relational Mapping  
- **SRS** – Software Requirements Specification  
- **Supabase** – Backend-as-a-Service platform  
- **Next.js** – React-based web framework  

## 1.4 References
- Next.js Documentation  
- Supabase Documentation  
- Prisma ORM Documentation  
- IEEE Software Engineering Standards  

## 1.5 Overview
This document is organized into system overview, functional requirements, external interfaces, system architecture, database design, and use cases.

---

# 2. Overall Description

## 2.1 Product Perspective
The system is a full-stack web application consisting of:
- Frontend: Next.js (React-based UI)
- Backend: Next.js API Routes
- Database: Supabase PostgreSQL
- ORM: Prisma
- AI Layer: External AI service for itinerary generation

The system follows a client-server architecture with API-driven communication.

## 2.2 Product Functions
The system provides the following key functions:
- User authentication (sign up, login, logout)
- User profile management
- Destination search and filtering
- AI-powered travel itinerary generation
- Budget-based trip planning
- Trip saving and history management
- Recommendation engine for places and activities

## 2.3 User Classes
- **Guest User**: Can view basic features
- **Registered User**: Can create and manage trips
- **System Admin (optional)**: Manages system data and monitoring

## 2.4 Operating Environment
- Web browsers (Chrome, Firefox, Edge)
- Node.js runtime environment
- Supabase cloud database
- Vercel or similar hosting platform

## 2.5 Design Constraints
- Requires internet connection
- Depends on Supabase availability
- AI API rate limits
- Must follow secure authentication standards

## 2.6 Assumptions
- Users have stable internet access
- Supabase project is properly configured
- AI API key is valid and active

---

# 3. Specific Requirements

## 3.1 Functional Requirements

### FR-1: User Registration
- Users can register using email and password
- Passwords are securely hashed via Supabase Auth
- Email verification may be required

### FR-2: User Login
- Users can log in using credentials
- Session is maintained using JWT
- Unauthorized access is restricted

### FR-3: Profile Management
- Users can update personal details
- Users can set travel preferences (budget, interests)

### FR-4: Destination Search
- Users can search destinations
- Filtering by country, budget, and category
- Display of relevant results

### FR-5: AI Travel Itinerary Generator
- Users input:
  - Destination
  - Travel duration
  - Budget
  - Preferences
- System generates:
  - Day-wise itinerary
  - Suggested activities
  - Travel tips

### FR-6: Trip Management
- Users can save generated trips
- Users can edit or delete trips
- Trips are stored per user

### FR-7: Recommendation System
- Suggest hotels, attractions, and activities
- Based on user preferences

### FR-8: Dashboard
- Displays saved trips
- Shows recent activity
- Provides quick access to planner

---

# 4. External Interface Requirements

## 4.1 User Interface
- Responsive UI (mobile-first design)
- Clean dashboard layout
- Form-based inputs for trip planning

## 4.2 Software Interfaces
- Supabase Auth API
- Supabase Database API
- Prisma ORM layer
- AI service API (OpenAI or similar)

## 4.3 Communication Interfaces
- HTTPS for secure communication
- REST API endpoints

---

# 5. Non-Functional Requirements

## 5.1 Performance
- Page load time under 2 seconds
- AI response within 3–10 seconds

## 5.2 Security
- Password encryption
- JWT-based authentication
- Secure API routes
- Protection against SQL injection

## 5.3 Reliability
- System should handle API failures gracefully
- Retry mechanism for AI requests

## 5.4 Scalability
- Supports multiple concurrent users
- Scalable database using Supabase

## 5.5 Maintainability
- Modular code structure
- Separation of frontend and backend logic

## 5.6 Usability
- Simple UI for non-technical users
- Minimal learning curve

---

# 6. System Architecture

The system follows a layered architecture:

### 6.1 Frontend Layer
- Next.js (React components)
- Tailwind CSS UI

### 6.2 Backend Layer
- Next.js API routes
- Business logic processing

### 6.3 Database Layer
- Supabase PostgreSQL
- Prisma ORM for queries

### 6.4 AI Layer
- External AI API for itinerary generation

### Data Flow:
User → Frontend → API Route → Prisma → Supabase → Response → AI Processing → UI

---

# 7. Database Design

## 7.1 Tables

### Users
- id (PK)
- email
- password_hash
- name
- created_at

### Trips
- id (PK)
- user_id (FK)
- destination
- budget
- start_date
- end_date

### Itineraries
- id (PK)
- trip_id (FK)
- day
- activities
- description

### Preferences
- id (PK)
- user_id (FK)
- interests
- travel_style

---

# 8. Use Cases

## UC-1: User Registration
Actor: User  
Flow:
1. User enters details
2. System validates input
3. Account created in Supabase

## UC-2: Login
Actor: User  
Flow:
1. Enter credentials
2. System verifies
3. Session created

## UC-3: Generate Trip
Actor: User  
Flow:
1. Input travel details
2. AI processes request
3. Itinerary generated

## UC-4: Save Trip
Actor: User  
Flow:
1. User saves itinerary
2. Stored in database

---

# 9. Future Enhancements
- Google Maps integration
- Flight booking API integration
- Hotel booking system
- Weather forecasting integration
- Mobile application version
- Social sharing of trips

---

# 10. Conclusion
The AI Travel Planner system provides an intelligent and user-friendly platform for automated travel planning. By combining AI-generated recommendations with a structured database system powered by Supabase and Prisma, the application enhances travel planning efficiency and personalization.

---