# ActiVibe Backend

Express.js REST API untuk ActiVibe - platform volunteer management.

## Features

✅ User Authentication (Register, Login, OTP Verification)
✅ JWT Token Management (Access & Refresh tokens)
✅ Password Hashing with bcrypt
✅ OTP Generation & Validation
✅ PostgreSQL Database with Prisma ORM
✅ Type-safe TypeScript
✅ CORS enabled
✅ Environment configuration

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── controllers/
│   │   └── auth.ts           # Authentication logic
│   ├── routes/
│   │   └── auth.ts           # Auth endpoints
│   ├── middleware/
│   │   └── auth.ts           # JWT verification middleware
│   └── utils/
│       ├── jwt.ts            # JWT utilities
│       └── validation.ts      # Validation functions
├── prisma/
│   └── schema.prisma         # Database schema
├── .env                      # Environment variables (local)
├── .env.example              # Environment variables template
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
└── API_DOCS.md              # API documentation
```

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb activibe

# Setup Prisma (create tables)
npm run db:push
```

### 3. Configure Environment
Sesuaikan `.env` dengan PostgreSQL Anda:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/activibe
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
PORT=3000
NODE_ENV=development
```

## Running

### Development Mode (with auto-reload)
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Build & Run Production
```bash
npm run build
npm start
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled server |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:migrate` | Create & run database migration |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## Testing Endpoints

### Using cURL

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123"
  }'
```

### Using Postman/Insomnia
1. Import collection dari API_DOCS.md
2. Set base URL: `http://localhost:3000`
3. Test endpoints satu per satu

## Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- phone (Unique, Optional)
- password (Hashed)
- name
- role (VOLUNTEER | ORGANIZER | ADMIN)
- verified (Boolean)
- createdAt
- updatedAt

### OTP Codes Table
- id (Primary Key)
- userId (Foreign Key)
- code (6 digits)
- email
- expiresAt
- usedAt (nullable)

### Activities Table
- id (Primary Key)
- title
- description
- category
- location
- startDate
- endDate
- capacity

### Profiles Table
- id (Primary Key)
- userId (Foreign Key, Unique)
- bio
- avatar
- city
- expertise (Array)

### Activity Participants Table
- id (Primary Key)
- userId (Foreign Key)
- activityId (Foreign Key)
- joinedAt

## Password Requirements

Password harus mengandung:
- ✓ Minimal 8 karakter
- ✓ Huruf besar (A-Z)
- ✓ Huruf kecil (a-z)
- ✓ Angka (0-9)

**Valid example:** `MyPassword123`

## TODO

- [ ] Setup PostgreSQL database
- [ ] Run `npm run db:push` to create tables
- [ ] Test authentication endpoints
- [ ] Integrate with frontend (ActiVibe/frontend)
- [ ] Add email/SMS service untuk OTP
- [ ] Add activity endpoints (CRUD)
- [ ] Add user profile endpoints
- [ ] Add input validation middleware
- [ ] Add rate limiting
- [ ] Add comprehensive error handling
- [ ] Add API logging
- [ ] Add tests (Jest)
- [ ] Setup CI/CD pipeline
- [ ] Deploy to production

## Common Issues

### Error: "connect ECONNREFUSED"
PostgreSQL server tidak jalan. Start PostgreSQL terlebih dahulu.

### Error: "Password must be at least 8 characters"
Gunakan password yang lebih kuat sesuai requirements.

### Error: "OTP is not valid"
Pastikan OTP code benar dan belum expired (10 menit).

## Need Help?

Refer ke `API_DOCS.md` untuk endpoint documentation lengkap.

---

**Next:** Jalankan backend dengan `npm run dev`, then integrate dengan frontend!
