# Netflix Clone

A full-stack Netflix clone that replicates the core Netflix experience — browse movies and TV shows, watch trailers, manage multiple profiles, and save favorites to a personal list. Powered by TMDB for real content data.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

## Features

- **Netflix intro animation** on first visit
- **Authentication** — email/password registration and login with JWT
- **Multi-profile support** — up to 5 profiles per account with a "Who's watching?" selector
- **Kids profile** mode per profile
- **Browse page** — 14+ content rows including trending, popular, now playing, upcoming, and genre-based categories
- **Billboard hero** — rotating featured content with auto-advance and embedded YouTube trailers
- **Content carousels** — horizontal scrolling rows with hover-zoom cards showing match %, year, and maturity rating
- **Detail modal** — full movie/TV info, cast, genres, runtime, similar titles, season/episode picker for TV
- **Trailer playback** via YouTube
- **Favorites / My List** — add and remove per profile
- **Search** — real-time search powered by TMDB multi-search
- **Genre browsing** — dedicated pages per genre
- **TMDB proxy** — API key stays on the server, never exposed to the client
- **Responsive design** — works across screen sizes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Go 1.22, Gin, JWT (`golang-jwt/v5`) |
| Database | PostgreSQL 16 |
| Containerization | Docker Compose |
| External API | [TMDB](https://www.themoviedb.org/) v3 |

## Architecture

```
Browser → Next.js (:3000) → Go API (:8000) → PostgreSQL (:5432)
                                            → TMDB API (proxied)
```

The frontend makes requests to `/api/*` which are proxied to the Go backend. The backend handles auth, profile/favorites CRUD, and proxies all TMDB requests so the API key is never exposed to the client.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+
- A [TMDB API key](https://www.themoviedb.org/settings/api)

### Environment Variables

Create a `.env` file in the project root:

```env
POSTGRES_USER=netflix
POSTGRES_PASSWORD=<REPLACE_ME>
POSTGRES_DB=netflix_clone
JWT_SECRET=<REPLACE_ME>
TMDB_API_KEY=<REPLACE_ME>
```

### Run

```bash
# Start PostgreSQL and the Go backend
docker-compose up --build

# In a separate terminal, start the frontend
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:3000**.

| Service | Port |
|---|---|
| Frontend | 3000 |
| Backend API | 8000 |
| PostgreSQL | 5432 |

## Database Schema

The database auto-migrates on startup:

| Table | Description |
|---|---|
| `users` | Accounts with email + bcrypt-hashed password |
| `profiles` | Up to 5 profiles per user with name, avatar, and kids flag |
| `favorites` | Per-profile saved movies/TV shows (TMDB ID + media type) |

## Project Structure

```
├── docker-compose.yml
├── backend/
│   ├── main.go              # Entry point, router setup
│   ├── config/              # Environment config
│   ├── db/                  # Database connection + auto-migrations
│   ├── handlers/            # Auth, profiles, favorites, TMDB proxy
│   ├── middleware/           # JWT auth middleware
│   └── models/              # User, Profile, Favorite structs
└── frontend/
    └── app/
        ├── browse/          # Main browse page + genre/my-list routes
        ├── components/      # Billboard, Navbar, ContentRow, DetailModal, etc.
        ├── contexts/        # Auth + Profile context providers
        ├── lib/             # API client + TMDB helpers
        ├── login/           # Login page
        ├── signup/          # Signup page
        ├── profiles/        # Profile selector page
        └── search/          # Search results page
```
