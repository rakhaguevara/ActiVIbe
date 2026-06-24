# ActiVibe Backend - API Documentation

## Setup

### Prasyarat
- Node.js (LTS)
- PostgreSQL 14+
- npm atau pnpm

### Installation

```bash
npm install
```

### Database Setup

1. **Create PostgreSQL database:**
   ```bash
   createdb activibe
   ```

2. **Setup Prisma:**
   ```bash
   npm run db:push
   ```

3. **(Optional) Open Prisma Studio:**
   ```bash
   npm run db:studio
   ```

### Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/activibe
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
```

## Running

### Development
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Register
- **URL:** `/auth/register`
- **Method:** POST
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123",
    "name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Registrasi berhasil. Silakan verifikasi OTP.",
    "userId": "user123",
    "email": "user@example.com"
  }
  ```

#### 2. Verify OTP
- **URL:** `/auth/verify-otp`
- **Method:** POST
- **Body:**
  ```json
  {
    "userId": "user123",
    "code": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Email terverifikasi",
    "userId": "user123",
    "email": "user@example.com"
  }
  ```

#### 3. Login
- **URL:** `/auth/login`
- **Method:** POST
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login berhasil",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "VOLUNTEER"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
  ```

#### 4. Refresh Access Token
- **URL:** `/auth/refresh-token`
- **Method:** POST
- **Body:**
  ```json
  {
    "refreshToken": "eyJhbGc..."
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "eyJhbGc..."
  }
  ```

---

## Data Models

### User
- `id` - User ID (unique, auto-generated)
- `email` - Email address (unique)
- `phone` - Phone number (optional, unique)
- `password` - Hashed password
- `name` - User name (optional)
- `role` - User role (VOLUNTEER, ORGANIZER, ADMIN)
- `verified` - Email verification status
- `createdAt` - Account creation date
- `updatedAt` - Last update date

### OTPCode
- `id` - OTP ID
- `userId` - Associated user
- `code` - OTP code (6 digit)
- `email` - Email used for OTP
- `expiresAt` - OTP expiration time (10 minutes)
- `usedAt` - When OTP was used

### Activity
- `id` - Activity ID
- `title` - Activity title
- `description` - Activity description
- `category` - Activity category
- `location` - Activity location
- `startDate` - Start date/time
- `endDate` - End date/time
- `capacity` - Maximum participants

### Profile
- `id` - Profile ID
- `userId` - Associated user
- `bio` - User bio
- `avatar` - Avatar URL
- `city` - City
- `expertise` - Array of expertise/skills

---

## Password Requirements

Password harus memenuhi kriteria:
- Minimal 8 karakter
- Mengandung huruf besar (A-Z)
- Mengandung huruf kecil (a-z)
- Mengandung angka (0-9)

**Example:** `MyPassword123`

---

## Error Responses

```json
{
  "error": "Error message here"
}
```

### Common Errors
- `400` - Bad Request (missing fields, validation error)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (email already registered)
- `500` - Server Error

---

## Next Steps

- [ ] Setup PostgreSQL database
- [ ] Run database migrations
- [ ] Test API endpoints with Postman/Insomnia
- [ ] Integrate with frontend
- [ ] Add email/SMS OTP sending service
- [ ] Add more endpoints (activities, profiles, etc.)
- [ ] Add logging and error handling
- [ ] Add rate limiting
- [ ] Add request validation middleware
