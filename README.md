# ProBridge Website 🏠

A full-stack real estate web platform built with **React + JavaScript** (frontend) and **Node.js + Express + MongoDB** (backend), mirroring the ProBridge mobile app.

---

## Project Structure

```
probridge-website/
├── frontend/          # React (CRA) + JavaScript
│   ├── public/
│   └── src/
│       ├── components/   # Navbar, Footer, PropertyCard, HeroSearch, EnquiryModal
│       ├── context/      # AuthContext, SavedContext
│       ├── pages/        # HomePage, SearchResultsPage, PropertyDetailPage, etc.
│       ├── services/     # api.js (Axios)
│       └── App.js
└── backend/           # Node.js + Express
    ├── config/        # db.js (MongoDB connection)
    ├── middleware/    # requireAuth, optionalAuth
    ├── models/        # User, Property, Enquiry, SavedProperty
    ├── routes/        # auth, properties, search, filters, saved, enquiries, upload
    └── server.js
```

---

## Features

### Frontend
- 🔍 **Hero Search** — city autocomplete, property type & budget filters
- 🏡 **Property Cards** — image, price, specs, save (heart), enquire
- 📋 **Search Results** — sidebar filters, pagination, active chips
- 🏠 **Property Detail** — gallery, full specs, enquiry form, call owner
- ❤️ **Saved Properties** — per-user wishlist synced with backend
- 📝 **Post Property** — multi-step form with image upload (Cloudinary)
- 👤 **Account Page** — profile + My Listings dashboard
- 🔐 **Auth** — Login / Register pages with JWT

### Backend
- **Same MongoDB** as the mobile app — reads from the existing `properties` collection
- `/api/properties` — paginated, filtered property listings (approved only)
- `/api/auth` — register / login / me (JWT)
- `/api/search` — full-text search + city autocomplete
- `/api/filters` — property types + budget ranges
- `/api/saved` — per-user saved toggle
- `/api/enquiries` — send enquiries (guests & logged-in users)
- `/api/upload` — Cloudinary image upload

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
# .env is already configured with your MongoDB & Cloudinary credentials
npm run dev
# Runs on http://localhost:5001
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Environment Variables

### Backend `.env`
| Key | Value |
|-----|-------|
| `PORT` | `5001` |
| `MONGODB_URI` | Your Atlas URI (already set) |
| `JWT_SECRET` | Secret key |
| `CLOUDINARY_*` | Cloudinary credentials (already set) |
| `CLIENT_URL` | `http://localhost:3000` |

### Frontend `.env`
| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `http://localhost:5001/api` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, CSS Modules |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas (shared with mobile app) |
| Images | Cloudinary |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Fonts | Manrope + Inter (Google Fonts) |

---

> Built to match the ProBridge mobile app's design language — Emerald green brand, Manrope + Inter typography, card-based property listings.

