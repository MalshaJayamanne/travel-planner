# 📘 Software Requirements Specification (SRS)
## Project: Travel Planner Web Application

---

# 1. Introduction

## 1.1 Purpose
The purpose of this document is to define the requirements for the **Travel Planner Web Application**, a web-based system that helps users plan, organize, and manage their travel itineraries efficiently.

This system allows users to create trips, manage destinations, store travel notes, and view planned journeys in a structured and user-friendly interface.

---

## 1.2 Scope
The Travel Planner system is a full-stack web application built using:

- Next.js (Frontend + Backend API routes)
- Prisma ORM
- Database (PostgreSQL / MongoDB)
- REST API architecture

The system will support:
- User authentication
- Trip creation and management
- Destination planning
- Travel schedule organization
- Basic dashboard analytics

---

## 1.3 Definitions
- **Trip**: A travel plan created by a user.
- **Destination**: A location included in a trip.
- **Itinerary**: Structured schedule of travel activities.
- **User**: A registered person using the system.

---

# 2. Overall Description

## 2.1 Product Perspective
The system is a standalone web application that can be accessed through a browser. It uses a client-server architecture:

- Frontend: Next.js UI
- Backend: Next.js API routes
- Database: Prisma-managed database

---

## 2.2 Product Functions

The system provides the following core functions:

- User registration and login
- Create, edit, delete travel trips
- Add destinations to trips
- Manage travel dates and notes
- View trip summaries
- Basic dashboard overview

---

## 2.3 User Classes

### 1. Guest User
- Can view landing page
- Can register

### 2. Registered User
- Can create and manage trips
- Can manage destinations
- Can view dashboard

### 3. Admin (optional future feature)
- Can manage users
- Can monitor system usage

---

## 2.4 Constraints

- Must use Next.js App Router
- Must use Prisma ORM
- Must support REST API routes
- Must be responsive (mobile + desktop)
- Must ensure secure authentication (JWT or session-based)

---

## 2.5 Assumptions

- Users have internet access
- Database is properly configured
- API keys (if any) are stored in `.env`

---

# 3. System Features

---

## 3.1 User Authentication

### Description
Users can register and log in to the system.

### Requirements
- Email + password registration
- Login authentication
- Session handling

---

## 3.2 Trip Management

### Description
Users can create and manage travel plans.

### Functionalities:
- Create trip
- Edit trip
- Delete trip
- View all trips

---

## 3.3 Destination Management

### Description
Each trip can contain multiple destinations.

### Functionalities:
- Add destination
- Edit destination
- Remove destination

---

## 3.4 Itinerary Planner

### Description
Users can schedule activities within a trip.

### Functionalities:
- Add daily plans
- Assign time slots
- Organize travel schedule

---

## 3.5 Dashboard

### Description
Provides overview of user travel activity.

### Functionalities:
- Total trips
- Upcoming trips
- Recent activity

---

# 4. External Interface Requirements

## 4.1 User Interface
- Responsive web UI
- Dashboard layout
- Forms for trip creation
- Navigation sidebar

---

## 4.2 Hardware Interfaces
- Standard web browser
- No special hardware required

---

## 4.3 Software Interfaces
- Next.js framework
- Prisma ORM
- PostgreSQL or MongoDB database
- Node.js runtime environment

---

# 5. System Architecture

## Architecture Style:
- Client-server architecture
- REST API-based backend
- Component-based frontend

---

## Tech Stack:

- Frontend: Next.js, React
- Backend: Next.js API Routes
- ORM: Prisma
- Database: PostgreSQL / MongoDB
- Styling: CSS / Tailwind (optional)

---

# 6. Database Design (High-Level)

## Entities:

### User
- id
- name
- email
- password
- createdAt

### Trip
- id
- title
- description
- startDate
- endDate
- userId

### Destination
- id
- name
- country
- city
- tripId

### Itinerary
- id
- tripId
- date
- activity
- time

---

# 7. Non-Functional Requirements

- Fast response time (< 2 seconds for API calls)
- Secure authentication
- Scalable architecture
- Responsive UI design
- High availability

---

# 8. Future Enhancements

- AI travel recommendations
- Google Maps integration
- Budget tracking
- Weather forecasting
- Mobile app version
- Share trips with friends

---

# 9. Conclusion

The Travel Planner system aims to simplify travel organization by providing a centralized platform for managing trips, destinations, and schedules. The system is scalable and can be extended into a commercial-level travel planning application.

---