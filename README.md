# Zinema 🎬

A full-stack movie booking application built with React, Spring Boot, AWS DynamoDB, Stripe, and Auth0.

**Live Demo:** [zinema-movie-booking.vercel.app](https://zinema-movie-booking.vercel.app)

> **Test credentials:**
> - Login with any email via Auth0
> - Test card: `4242 4242 4242 4242` · Expiry: `12/27` · CVC: `123`

---

## Tech stack

### Frontend
- React 18 + Vite + TypeScript
- React Router v7 — client-side routing
- TanStack Query — data fetching
- Axios — HTTP client
- Auth0 React SDK — authentication
- Stripe React Elements — payment UI
- Deployed on **Vercel**

### Backend
- Java 21 + Spring Boot 4
- Spring Security + OAuth2 Resource Server — JWT validation
- AWS SDK v2 — DynamoDB and S3
- Stripe Java SDK — payment processing
- Auth0 JWT — role-based access control
- Deployed on **Render** via Docker

### Infrastructure
- **AWS DynamoDB** — NoSQL database (movies, showtimes, bookings)
- **AWS S3** — file storage (movie posters)
- **Auth0** — authentication and authorization
- **Stripe** — payment processing
- **TMDB API** — real movie data and posters
- **Docker** — containerized deployment
- **LocalStack** — local AWS emulation during development

---

## Features

### User features
- 🎬 Browse 15 popular movies fetched from TMDB with real posters
- 🔍 Search movies by title, genre or director
- 🎭 View movie details and available showtimes
- 💺 Interactive seat picker — booked seats shown in real time
- 💳 Stripe checkout payment before booking confirmation
- 📋 View booking history with movie title, showtime and seat
- ❌ Cancel bookings with refund notice

### Admin features
- ➕ Add new movies and showtimes
- 🗑️ Soft delete movies (existing bookings preserved)
- 📊 View all bookings across all users
- 🔐 Role-based access — admin actions protected by JWT

### Technical features
- JWT authentication via Auth0
- Role-based access control (`admin` / `user`)
- Pre-signed S3 URLs for secure file uploads
- DynamoDB transactions for atomic seat reservations
- CORS configured for cross-origin requests
- DTOs to clean up API responses
- Auto table and bucket creation on startup

---

## Architecture

```
User's Browser
      │
      ▼
Vercel (React Frontend)
      │
      │ HTTPS API calls
      ▼
Render (Spring Boot Backend — Docker)
      │
      ├── AWS DynamoDB    ← stores movies, showtimes, bookings
      ├── AWS S3          ← stores movie poster images
      ├── Auth0           ← validates JWT tokens
      ├── Stripe          ← processes payments
      └── TMDB API        ← fetches movie data on startup
```

---

## Project structure

```
zinema-movie-booking/
├── movie-booking/
│   ├── backend/                    ← Spring Boot API
│   │   ├── src/main/java/com/zinema/backend/
│   │   │   ├── config/             ← AWS, Auth0, Stripe, Security config
│   │   │   ├── controller/         ← REST endpoints
│   │   │   ├── service/            ← Business logic
│   │   │   ├── repository/         ← DynamoDB CRUD
│   │   │   ├── model/              ← Movie, Booking, Showtime, Payment
│   │   │   └── dto/                ← Data Transfer Objects
│   │   ├── src/main/resources/
│   │   │   ├── application.yml     ← Local config
│   │   │   └── application-prod.yml ← Production config
│   │   └── Dockerfile              ← Docker deployment
│   ├── frontend/                   ← React app
│   │   ├── src/
│   │   │   ├── components/         ← NavBar, MovieCard, StripeCheckout
│   │   │   ├── pages/              ← HomePage, MovieDetailPage, BookingPage, etc.
│   │   │   └── types/              ← TypeScript interfaces
│   │   └── .env                    ← Local environment variables
│   └── docker/
│       └── docker-compose.yml      ← LocalStack for local development
```

---

## API endpoints

### Movies
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/movies` | Public | Get all movies |
| GET | `/api/movies/{id}` | Public | Get single movie |
| POST | `/api/movies` | Admin | Create movie |
| PUT | `/api/movies/{id}` | Admin | Update movie |
| DELETE | `/api/movies/{id}` | Admin | Soft delete movie |

### Showtimes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/showtimes` | Public | Get all showtimes |
| GET | `/api/showtimes/{id}` | Public | Get single showtime |
| GET | `/api/showtimes/movie/{movieId}` | Public | Get showtimes for a movie |
| POST | `/api/showtimes` | Admin | Create showtime |
| DELETE | `/api/showtimes/{id}` | Admin | Delete showtime |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Admin | Get all bookings |
| GET | `/api/bookings/my` | Authenticated | Get my bookings |
| GET | `/api/bookings/showtime/{id}/seats` | Public | Get booked seats |
| POST | `/api/bookings` | Authenticated | Create booking |
| PUT | `/api/bookings/{id}/cancel` | Authenticated | Cancel booking |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-payment-intent` | Authenticated | Create Stripe payment intent |

### S3
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/s3/presigned-url` | Admin | Get presigned URL for poster upload |

---

## DynamoDB tables

### zinema-movies
| Key | Type | Example |
|-----|------|---------|
| movieId (PK) | String | `MOVIE-uuid` |
| sk (SK) | String | `METADATA` |

### zinema-showtimes
| Key | Type | Example |
|-----|------|---------|
| showtimeId (PK) | String | `SHOWTIME-uuid` |
| sk (SK) | String | `METADATA` |

### zinema-bookings
| Key | Type | Example |
|-----|------|---------|
| userId (PK) | String | `auth0\|user-id` |
| sk (SK) | String | `BOOKING-uuid` |

---

## Local development setup

### Prerequisites
- Java 21
- Node.js 20+
- Docker Desktop
- AWS CLI
- Maven

### 1. Clone the repo
```bash
git clone https://github.com/FatemaBohra/zinema-movie-booking.git
cd zinema-movie-booking/movie-booking
```

### 2. Start LocalStack
```bash
cd docker
docker-compose up -d
```

### 3. Set up backend secrets
Create `backend/src/main/resources/application-secrets.yml`:
```yaml
stripe:
  secret-key: sk_test_your-stripe-key

tmdb:
  api-key: your-tmdb-api-key
```

### 4. Start Spring Boot
Open `backend/` in IntelliJ and run `Zinema.java`

Tables and S3 bucket are created automatically on startup. Movies are seeded from TMDB automatically.

### 5. Set up frontend environment
Create `frontend/.env`:
```
VITE_AUTH0_DOMAIN=your-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://zinema-api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
VITE_API_URL=http://localhost:8080
```

### 6. Start React
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Deployment

### Backend (Render)
- Runtime: Docker
- Build: `./mvnw clean package -DskipTests`
- Start: `java -jar target/*.jar --spring.profiles.active=prod`
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `STRIPE_SECRET_KEY`, `TMDB_API_KEY`, `SPRING_PROFILES_ACTIVE`

### Frontend (Vercel)
- Framework: Vite
- Root directory: `movie-booking/frontend`
- Environment variables: `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_URL`

---

## Booking flow

```
1. User browses movies → clicks showtime
2. Seat picker shows available and booked seats
3. User selects seat → clicks Book Now
4. Auth0 login required if not authenticated
5. Stripe payment intent created on backend
6. User enters card details → payment processed
7. On success → booking created in DynamoDB
8. Available seats decremented on showtime
9. User redirected to booking history
```

---

## Auth flow

```
1. User clicks Login
2. Auth0 login page shown
3. User logs in → Auth0 returns JWT with roles claim
4. React stores token via Auth0 SDK
5. Token sent in Authorization: Bearer header on API calls
6. Spring Boot validates token against Auth0 domain
7. Role checked for protected endpoints (admin only)
```

---

## Stripe test cards

| Card number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication |

Use any future expiry date and any 3-digit CVC.

---

## Note on free tier

The backend runs on Render's free tier which spins down after 15 minutes of inactivity. UptimeRobot is configured to ping the backend every 14 minutes to keep it alive. First load after extended inactivity may take up to 30 seconds.

---

## Author

**Fatema Bohra**
- GitHub: [@FatemaBohra](https://github.com/FatemaBohra)
- Portfolio: [your-portfolio-url]

