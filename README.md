# Morad's Journal — Personal Travel Blog

A full-stack Travel Journal and Blog, built to document journeys, share stories, and inspire others in their travels.

---

## Purpose

This project was born out of a passion for travel and a desire to document every journey in one place. The goal is to highlight all the countries visited, share articles and photos from each trip, and give others a glimpse of the places I've been to — hopefully sparking some inspiration along the way.

It also works as a companion app, constantly updated as new places are visited by myself. An admin panel makes it seamless to upload photos and publish articles in seconds.

---

## Design Philosophy

The design mo was to create a unique Travel Blog, to stand out from the vast librarys of blog websites out there. Focus was made on creating a very **visual experience**, utilising images and illustrations, putting people in those countries and inspirning them to book their next holiday.

A **map and stats section** gives a birds-eye view of all travels so far: how many countries visited, which regions explored, and where to go next. The interactive globe and map puts all the jorneys into perspective, and helps create ideas on where to travel next.

---

## Features

- **Home** — animated hero with a photo carousel, bio, and featured recent posts
- **Blog** — article listing with full rich-text posts (headings, images, links)
- **Gallery** — masonry photo grid with animated scrolling columns, country/media filters, and a lightbox viewer
- **Map** — interactive world map with visited countries highlighted, a country sidebar, and a travel timeline
- **Stats** — at-a-glance numbers: countries visited, continents, photos, posts
- **Admin Panel** — protected dashboard for managing posts, gallery uploads (drag & drop), countries, and map data
- **Contact** — email form powered by Resend

---

## Tech Stack

### Frontend

| Tech | Why |
|---|---|
| **React 19** | Bread and butter — component model, ecosystem, and familiarity made it the natural choice |
| **TypeScript** | First complete full-stack TypeScript project; catching type errors early saved significant debugging time |
| **Vite** | Extremely fast dev server and build tooling |
| **SCSS (Sass)** | Covers everything needed for a frontend styling framework — variables, mixins, breakpoints, animations — all in one place with effortless updating |
| **Framer Motion** | Smooth, seamless transitions and scroll-triggered animations throughout the UI |
| **TanStack Query** | Handles all server state, caching, and data hydration; essential given the volume of variable data across the app |
| **React Router v7** | Client-side routing with nested layouts |
| **deck.gl** | Powers the interactive globe and world map. Incredibly intuitive to configure and manipulate — GeoJSON layers, custom colouring, and auto-rotation all came together cleanly |
| **MapLibre GL / react-map-gl** | Detailed country-level map on the Map page |
| **React Hook Form + Zod** | Form handling and validation — concise, performant, and type-safe |
| **Tiptap** | Rich-text editor for blog post creation in the admin panel |
| **Framer Motion** | Page transitions and scroll animations |
| **Lucide React + React Icons** | Icon libraries covering all UI needs |
| **react-country-flag** | SVG country flags rendered consistently across platforms |
| **yet-another-react-lightbox** | Gallery lightbox with keyboard navigation, swipe, and video support |
| **exifr** | Reads EXIF metadata (date, location) from uploaded photos automatically |
| **DOMPurify** | Sanitises rich-text HTML before rendering to prevent XSS |
| **Axios** | HTTP client for all API calls |

### Backend

| Tech | Why |
|---|---|
| **Node.js + Express 5** | Lightweight, familiar REST API server |
| **TypeScript** | End-to-end type safety across the whole stack |
| **Prisma** | ORM that meshes TypeScript, Node, and PostgreSQL cleanly — schema-first, fully typed queries |
| **PostgreSQL (Railway)** | Started on Supabase but moved to Railway so the server stays always active (Supabase free tier idles). Railway PostgreSQL has been reliable with zero cold start issues |
| **Cloudinary** | Image hosting and CDN — handles upload, transformation, and delivery |
| **JWT + bcryptjs** | Secure authentication for the admin panel |
| **Resend** | Transactional email for the contact form |
| **Helmet + CORS** | Security headers and origin control |
| **Multer** | Multipart file upload handling before passing to Cloudinary |
| **Zod** | Request body validation on the server |

### Infrastructure

| | |
|---|---|
| **Client** | Netlify (continuous deploy from GitHub) |
| **Server** | Railway (Node.js service, always-on) |
| **Database** | Railway PostgreSQL |
| **Media** | Cloudinary |

---

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL (or a Railway/Supabase connection string)
- A Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/Morad17/personal-travel-blog.git
cd personal-travel-blog
```

### 2. Set up the server

```bash
cd server
npm install
```

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

JWT_SECRET="your-secret"
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

RESEND_API_KEY="..."
CONTACT_EMAIL="your@email.com"

CLIENT_URL=http://localhost:5173
```

Push the schema to your database and generate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## Future Updates

- **More interactive map** — city-level stops alongside highlighted countries, with an animated journey line tracing the route
- **Integrated timeline** — visual animated path connecting all destinations in chronological order
- **Gallery improvements** — better UX when clicking into an image, smarter categorisation by trip/date

---

## Notes on Architecture

The Prisma schema was pushed directly (`db push`) rather than using migrations, which suited the pace of solo development. For a team environment, `migrate dev` would be the right call.

The deck.gl globe originally had a 3D top layer with markers for visited cities — this was removed because zooming into individual countries felt visually sub-par and worked against the clean UX goal. The flat GeoJSON approach gives better performance and a more polished look.