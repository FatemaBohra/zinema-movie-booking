# Zinema Backend

Spring Boot REST API for the Zinema movie booking application.

## Tech stack

- Java 21
- Spring Boot 4.0.7
- Spring Security + Auth0 JWT
- AWS DynamoDB (via LocalStack locally)
- AWS S3 (via LocalStack locally)
- Stripe payments
- Docker + LocalStack

---

## Architecture

```
React Frontend
      │
      ▼
Spring Boot (port 8080)
      │
      ├── Controller  →  receives HTTP requests, returns JSON
      ├── Service     →  business logic
      ├── Repository  →  talks to DynamoDB
      └── Config      →  wires up AWS, Auth0, Stripe on startup
            │
            ▼
      LocalStack (port 4566)
            ├── DynamoDB  →  stores movies, showtimes, bookings
            └── S3        →  stores movie poster images
```

---

## Package structure

```
com.zinema.backend/
├── controller/       REST endpoints
├── service/          Business logic
├── repository/       DynamoDB CRUD operations
├── model/            Entity classes (Movie, Booking, Seat, Payment, Showtime)
├── dto/              Request/response objects (to be implemented)
├── config/           AWS, Auth0, Stripe configuration
└── exception/        Custom exceptions (to be implemented)
```

---

## API endpoints

### Movies — `/api/movies`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/movies` | Public | Get all movies |
| GET | `/api/movies/{movieId}` | Public | Get single movie |
| POST | `/api/movies` | Admin | Create movie |
| PUT | `/api/movies/{movieId}` | Admin | Update movie |
| DELETE | `/api/movies/{movieId}` | Admin | Delete movie |

### Showtimes — `/api/showtimes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/showtimes` | Public | Get all showtimes |
| GET | `/api/showtimes/{showtimeId}` | Public | Get single showtime |
| GET | `/api/showtimes/movie/{movieId}` | Public | Get showtimes for a movie |
| POST | `/api/showtimes` | Admin | Create showtime |
| DELETE | `/api/showtimes/{showtimeId}` | Admin | Delete showtime |

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description                                                                         |
|--------|----------|------|-------------------------------------------------------------------------------------|
| GET | `/api/bookings` | Authenticated | Get all bookings                                                                    |
| GET | `/api/bookings/my` | Authenticated | Get user's bookings. No "userID" needed as it comes automatically from the JWT token. |
| POST | `/api/bookings` | Authenticated | Create booking                                                                      |
| PUT | `/api/bookings/{bookingId}/cancel` | Authenticated | Cancel booking                                                                      |

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-payment-intent` | Public (temp) | Create Stripe payment intent |

### S3 — `/api/s3`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/s3/presigned-url` | Admin | Get presigned URL for poster upload |

---

## Data flow

### Booking flow
```
1. User selects showtime + seat
2. React calls POST /api/payments/create-payment-intent
3. Spring Boot creates Stripe PaymentIntent → returns clientSecret
4. React uses clientSecret to show Stripe checkout UI
5. User enters card → Stripe processes payment
6. On success → React calls POST /api/bookings
7. Spring Boot creates booking in DynamoDB
8. Spring Boot decrements availableSeats on showtime
```

### Poster upload flow
```
1. Admin selects image file in React
2. React calls GET /api/s3/presigned-url with fileName + contentType
3. Spring Boot generates presigned S3 URL → returns uploadUrl + posterUrl
4. React uploads image directly to S3 using uploadUrl (bypasses backend)
5. Admin saves movie with posterUrl
```

### Auth flow
```
1. User clicks Login in React
2. Auth0 shows login page
3. User logs in → Auth0 returns JWT token with roles claim
4. React stores token in localStorage
5. React sends token in Authorization: Bearer header on every API call
6. Spring Boot validates token against Auth0 domain
7. Spring Boot checks role (admin/user) for protected endpoints
```

---

## DynamoDB tables

### zinema-movies
| Key | Type | Description |
|-----|------|-------------|
| movieId (PK) | String | e.g. `MOVIE-uuid` |
| sk (SK) | String | Always `METADATA` |

### zinema-showtimes
| Key | Type | Description |
|-----|------|-------------|
| showtimeId (PK) | String | e.g. `SHOWTIME-uuid` |
| sk (SK) | String | Always `METADATA` |

### zinema-bookings
| Key | Type | Description |
|-----|------|-------------|
| userId (PK) | String | e.g. `USER-123` |
| sk (SK) | String | e.g. `BOOKING-uuid` |

---

## Config classes

| Class | Purpose |
|-------|---------|
| `DynamoDbConfig` | Creates DynamoDB client bean pointing to LocalStack |
| `S3Config` | Creates S3 client and presigner beans |
| `StripeConfig` | Initializes Stripe with secret key on startup |
| `SecurityConfig` | Defines public vs protected endpoints, JWT validation |
| `AwsInitializer` | Auto-creates DynamoDB tables and S3 bucket on startup |

---

## Local development setup

### Prerequisites
- Java 21
- Docker Desktop
- AWS CLI
- Maven

### Steps

**1. Start Docker Desktop**

**2. Start LocalStack:**
```bash
cd docker
docker-compose up -d
```

**3. Create `application-secrets.yml` in `src/main/resources/`:**
```yaml
stripe:
  secret-key: sk_test_your-key-here
```

**4. Run Spring Boot:**
```bash
./mvnw spring-boot:run
```

Tables and S3 bucket are created automatically on startup via `AwsInitializer`.

---

## Environment variables

| Variable | Location | Description |
|----------|----------|-------------|
| `stripe.secret-key` | `application-secrets.yml` | Stripe secret key |
| `auth0.domain` | `application.yml` | Auth0 domain |
| `auth0.audience` | `application.yml` | Auth0 API identifier |
| `aws.endpoint` | `application.yml` | LocalStack endpoint (local) or AWS (prod) |

---

## Deferred / upcoming work

- [ ] Extract userId from JWT token in BookingService
- [ ] Add DTOs to clean up API responses
- [ ] Re-enable Stripe payment authentication
- [ ] Link paymentIntentId to booking after Stripe confirms payment
- [ ] Role-based access using `@PreAuthorize`
- [ ] Deploy to Railway/Render with real AWS DynamoDB and S3

---

## Test credentials (LocalStack)

```
AWS Access Key: test
AWS Secret Key: test
Region: us-east-1
DynamoDB/S3 endpoint: http://localhost:4566
```

---

## Stripe test cards

| Card number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |

Use any future expiry date and any 3-digit CVC.
