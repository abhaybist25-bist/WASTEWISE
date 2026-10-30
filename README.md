# WasteWise — Smart Food Waste Reduction & Redistribution Platform

> **An AI-powered, database-driven full-stack web platform connecting food donors with verified recipient organisations to eliminate food waste and feed communities.**

Built with **Spring Boot 3 (Java 25)**, **MongoDB**, **React 18 (Vite)**, **Tailwind CSS**, and **Google Gemini AI**.

---

## 🌟 Live Application Status

- **Frontend Development Server**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:8080`
- **API Documentation & Platform Summary**: `http://localhost:8080/api/analytics/platform-summary`
- **Database**: MongoDB on `127.0.0.1:27017` (Database: `wastewise_db`)

---

## 👥 Demo Accounts (Pre-Seeded in MongoDB)

| Role | Name | Email | Password | Permissions & Notes |
|------|------|-------|----------|---------------------|
| **Admin** | Super Administrator | `admin@wastewise.org` | `Admin@123` | Platform-wide oversight, verify recipient orgs, flag/moderate listings, user suspension |
| **Donor** | Chef Vikram Malhotra | `donor@grandhotel.com` | `Donor@123` | Grand Palace Hotel & Banquets: Create food listings, FSSAI declarations, accept claims, confirm pickup |
| **Recipient (Verified)** | Sister Ananya Rao | `contact@annaseva.org` | `Ngo@123` | Anna Seva Trust (APPROVED): Discover food, claim quantities, coordinate pickup, confirm delivery |
| **Recipient (Pending)** | Rajesh Kumar | `hope@shelter.org` | `Ngo@123` | Hope Shelter Home (PENDING): Can browse food; claims blocked until admin approval |
| **Volunteer** | Amit Sharma | `volunteer@wastewise.org` | `Volunteer@123` | Transportation and milestone delivery tracking |

*Demo accounts can also be fetched at runtime via `GET /api/demo/credentials`.*

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Java 25 LTS** (`java -version`)
2. **Maven 3.9+** (`mvn -v`)
3. **Node.js 18+ & npm** (`node -v`, `npm -v`)
4. **MongoDB 6.0+** running on `127.0.0.1:27017`

### 1. Database Setup
Ensure MongoDB is running locally:
```bash
# Windows Service Check
Get-Service -Name MongoDB
# Or connect with MongoDB Compass to:
mongodb://127.0.0.1:27017/wastewise_db
```
*The database and initial seed data are initialized automatically upon first backend launch.*

### 2. Backend Setup & Startup
```bash
cd backend

# Build and run tests
mvn clean test

# Start the Spring Boot Application
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.

### 3. Frontend Setup & Startup
```bash
cd frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev
```
The frontend is available at `http://localhost:5173`.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React 18 + Vite Frontend               │
│   Tailwind CSS  │  React Router  │  Leaflet Map  │ Recharts │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Axios + JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot 3.3.5 Backend                 │
│  Spring Security + JWT  │  Bean Validation  │  Gemini AI    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Spring Data MongoDB
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                        │
│   users  │  organizations  │  donations  │  claims  │ etc.  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Features Overview

1. **Role-Based Access Control (RBAC)**: Strict role guards (Donor, Recipient, Volunteer, Admin) enforced both on frontend routes and backend Spring Security (`@PreAuthorize`).
2. **Surplus Food Listing**: Donors specify food category, preparation time, storage conditions, packaging, allergen warnings, GPS coordinates, and pickup deadlines.
3. **FSSAI Food Safety Workflow**: Mandatory food-safety declarations before donation publishing. Listings with passed pickup deadlines are automatically flagged/ineligible for claims.
4. **Multi-Step Claim Lifecycle**:
   - Recipient claims partial or full quantity
   - Backend validates organization verification status and quantity availability
   - Donor reviews and accepts claim (`ACCEPTED`)
   - Donor confirms collection (`PICKUP_CONFIRMED`)
   - Recipient confirms receipt (`DELIVERED`)
   - Automatic meal rescue and carbon footprint calculations
5. **Interactive Geo-Location Maps**: Leaflet and OpenStreetMap integration for visual donation discovery and pickup coordination.
6. **Smart Matching & Recommendations**: AI/heuristic engine matching recipient daily meal capacity, preferred food categories, and geographic proximity.
7. **Gemini AI Waste Insights**: Real-time AI analysis of donor patterns to suggest waste prevention strategies.
8. **Comprehensive Dashboards**:
   - **Donor**: Monthly rescue charts, category distribution, active claims.
   - **Recipient**: Claim progress tracker, recommended matches.
   - **Admin**: Organization verification approvals, listing moderation, user management, impact analytics.

---

## 🧪 Running Automated Tests

```bash
# Run backend unit & integration tests
cd backend
mvn test

# Run frontend production build test
cd frontend
npm run build
```

---

## 📄 License
Academic Project — B.E. Computer Science & Engineering.
Developed for WasteWise Food Rescue Initiative.

