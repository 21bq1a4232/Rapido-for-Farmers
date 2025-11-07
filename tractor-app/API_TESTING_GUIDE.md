# 🚀 API Testing Guide - Tractor Marketplace

**Complete API Reference with Test Examples**
All endpoints are now operational and ready to test!

---

## 🔧 Setup & Getting Started

### 1. Start the Backend

```bash
cd tractor-app/backend

# Install dependencies (first time only)
npm install

# Seed database with sample data
npm run seed

# Start server
npm run dev
```

Server will run on: `http://localhost:5000`

### 2. Test Tools

Use any of these:
- **curl** (command line)
- **Thunder Client** (VS Code extension - recommended)
- **Postman**
- **Insomnia**

---

## 📡 API Endpoints Summary

### ✅ Authentication (4 endpoints)
- POST `/api/auth/send-otp` - Send OTP
- POST `/api/auth/verify-otp` - Verify OTP & get token
- POST `/api/auth/resend-otp` - Resend OTP
- GET `/api/auth/me` - Get current user (protected)

### ✅ Users (4 endpoints)
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/profile` - Update profile (protected)
- GET `/api/users/wallet/balance` - Get wallet (protected)
- GET `/api/users/stats/me` - Get stats (protected)

### ✅ Tractors (7 endpoints)
- POST `/api/tractors` - Create tractor (protected, owner only)
- GET `/api/tractors` - List all tractors
- GET `/api/tractors/nearby` - **Find nearby tractors (geospatial)**
- GET `/api/tractors/:id` - Get tractor details
- GET `/api/tractors/my/tractors` - Get my tractors (protected)
- PUT `/api/tractors/:id` - Update tractor (protected, owner only)
- DELETE `/api/tractors/:id` - Delete tractor (protected, owner only)

### ✅ Bookings (9 endpoints)
- POST `/api/bookings` - Create booking (protected, farmer only)
- GET `/api/bookings` - Get my bookings (protected)
- GET `/api/bookings/:id` - Get booking details (protected)
- PUT `/api/bookings/:id/accept` - Accept booking (protected, owner)
- PUT `/api/bookings/:id/reject` - Reject booking (protected, owner)
- PUT `/api/bookings/:id/start` - Start with OTP (protected)
- PUT `/api/bookings/:id/complete` - Complete with OTP (protected)
- PUT `/api/bookings/:id/cancel` - Cancel booking (protected)
- POST `/api/bookings/:id/rate` - Rate after completion (protected)

**Total: 24 working API endpoints** ✅

---

## 🧪 Complete Testing Flow

### Step 1: Authentication

**1.1 Send OTP**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

**1.2 Verify OTP**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673c1234567890abcdef",
    "phone": "9876543210",
    "name": "Owner 1",
    "role": ["owner"],
    "village": "Khanna",
    "language": "hi",
    "wallet": 2341,
    "rating": 4.2,
    "isVerified": true
  }
}
```

**🔑 Save the token!** You'll need it for protected routes.

**1.3 Get Current User**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 2: Find Nearby Tractors (Geospatial Search)

**2.1 Search Tractors Near Punjab (30.9, 75.8)**
```bash
curl "http://localhost:5000/api/tractors/nearby?lat=30.9&lng=75.8&radius=15"
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "searchLocation": {
    "latitude": 30.9,
    "longitude": 75.8
  },
  "radiusKm": 15,
  "tractors": [
    {
      "_id": "673c...",
      "model": "575 DI",
      "brand": "Mahindra",
      "horsepower": 50,
      "pricePerHour": 550,
      "pricePerAcre": 900,
      "location": {
        "type": "Point",
        "coordinates": [75.7892, 30.9123]
      },
      "address": "Near Khanna",
      "rating": 4.1,
      "totalBookings": 23,
      "isActive": true,
      "owner": {
        "name": "Owner 1",
        "phone": "9876543210",
        "village": "Khanna",
        "rating": 4.2
      },
      "distance": 1.23  // km from search location
    }
  ]
}
```

**2.2 Get Specific Tractor Details**
```bash
curl http://localhost:5000/api/tractors/TRACTOR_ID_HERE
```

---

### Step 3: Create a Booking (As Farmer)

**3.1 First, login as a farmer**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8765432100",
    "otp": "123456"
  }'
```

**3.2 Create Booking**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "tractorId": "TRACTOR_ID_HERE",
    "startTime": "2025-11-10T08:00:00Z",
    "duration": 4,
    "acres": 3,
    "workType": "plowing",
    "farmAddress": "My farm near village"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully. Waiting for owner approval.",
  "booking": {
    "_id": "673c...",
    "farmer": {...},
    "tractor": {...},
    "owner": {...},
    "startTime": "2025-11-10T08:00:00.000Z",
    "endTime": "2025-11-10T12:00:00.000Z",
    "duration": 4,
    "acres": 3,
    "workType": "plowing",
    "totalAmount": 2200,
    "platformFee": 330,
    "ownerEarnings": 1870,
    "status": "pending",
    "paymentStatus": "pending"
  },
  "startOTP": "1234",  // Development mode only
  "endOTP": "5678"     // Development mode only
}
```

---

### Step 4: Owner Accepts Booking

**4.1 Login as owner**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'
```

**4.2 Accept the booking**
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "booking": {
    "_id": "...",
    "status": "accepted"
  }
}
```

---

### Step 5: Start Work with OTP

**5.1 Farmer starts work using OTP**
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "otp": "1234"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking started successfully",
  "booking": {
    "status": "in-progress",
    "actualStartTime": "2025-11-07T10:30:00.000Z"
  }
}
```

---

### Step 6: Complete Work with OTP

**6.1 Complete the booking**
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "otp": "5678"
  }'
```

---

### Step 7: Rate the Experience

**7.1 Farmer rates owner & tractor**
```bash
curl -X POST http://localhost:5000/api/bookings/BOOKING_ID/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "rating": 5,
    "review": "Excellent tractor, very professional owner!"
  }'
```

**7.2 Owner rates farmer**
```bash
curl -X POST http://localhost:5000/api/bookings/BOOKING_ID/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -d '{
    "rating": 5,
    "review": "Great farmer, took good care of the tractor!"
  }'
```

---

## 🎯 Testing Specific Features

### Geospatial Search
```bash
# Find tractors within 5km
curl "http://localhost:5000/api/tractors/nearby?lat=30.9010&lng=75.8573&radius=5"

# Find tractors within 20km
curl "http://localhost:5000/api/tractors/nearby?lat=30.9010&lng=75.8573&radius=20"

# Default radius is 10km
curl "http://localhost:5000/api/tractors/nearby?lat=30.9010&lng=75.8573"
```

### Booking Conflict Detection
Try creating two bookings for the same tractor at overlapping times:

```bash
# Booking 1
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "tractorId": "SAME_TRACTOR_ID",
    "startTime": "2025-11-10T08:00:00Z",
    "duration": 4
  }'

# Booking 2 (will fail - conflict!)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "tractorId": "SAME_TRACTOR_ID",
    "startTime": "2025-11-10T10:00:00Z",
    "duration": 4
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Tractor is already booked for this time period"
}
```

### Filter Tractors
```bash
# By price range
curl "http://localhost:5000/api/tractors?minPrice=400&maxPrice=600"

# By horsepower
curl "http://localhost:5000/api/tractors?minHP=50&maxHP=70"

# Combined
curl "http://localhost:5000/api/tractors?minPrice=400&maxPrice=600&minHP=50&maxHP=70"
```

### Get My Bookings
```bash
# All my bookings
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl "http://localhost:5000/api/bookings?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by role
curl "http://localhost:5000/api/bookings?role=farmer" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧑‍🌾 Test User Credentials

All created by seed script:

### Owners (can list tractors)
```
9876543210 - Owner 1 (Khanna)
9876543211 - Owner 2 (Samrala)
9876543212 - Owner 3 (Raikot)
9876543213 - Owner 4 (Payal)
9876543214 - Owner 5 (Doraha)
```

### Farmers (can book tractors)
```
8765432100 - Farmer 1 (Payal)
8765432101 - Farmer 2 (Doraha)
8765432102 - Farmer 3 (Machhiwara)
8765432103 - Farmer 4 (Sidhwan Bet)
8765432104 - Farmer 5 (Sahnewal)
```

**OTP:** Any 6-digit code works in development (default: `123456`)

---

## ✨ Key Features Implemented

### 1. **Geospatial Search** ✅
- Finds tractors within specified radius
- Uses MongoDB 2dsphere index
- Calculates and returns distance
- Sorts by proximity

### 2. **Booking Conflict Prevention** ✅
- Checks for time overlaps
- Prevents double-booking
- Works across date ranges

### 3. **OTP Verification** ✅
- Unique OTPs for start/end
- Logged in console (dev mode)
- Prevents fraud

### 4. **Rating System** ✅
- Updates user ratings
- Updates tractor ratings
- Running average calculation
- Prevents duplicate ratings

### 5. **Role-Based Access** ✅
- Farmers can book
- Owners can list tractors
- "both" role for flexibility
- Route-level protection

### 6. **Payment Calculation** ✅
- Automatic total calculation
- 15% platform fee
- 85% owner earnings
- Per-hour or per-acre pricing

---

## 🐛 Testing Error Cases

### Invalid OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "000000"
  }'
```

Expected: `{"success": false, "message": "Invalid or expired OTP"}`

### Unauthorized Access
```bash
# Try to create tractor as farmer
curl -X POST http://localhost:5000/api/tractors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d '{
    "model": "Test",
    "horsepower": 50,
    "pricePerHour": 500,
    "location": {"coordinates": [75.8, 30.9]}
  }'
```

Expected: `{"success": false, "message": "User role (farmer) is not authorized..."}`

### Booking Conflict
Already shown above ☝️

---

## 📊 What's Working

✅ **Complete Authentication Flow**
- OTP send/verify/resend
- JWT token generation
- Protected routes

✅ **Full Tractor Management**
- CRUD operations
- Geospatial search
- Ownership verification

✅ **Complete Booking Lifecycle**
- Create → Accept/Reject → Start → Complete → Rate
- Conflict detection
- OTP verification
- Status tracking

✅ **User Management**
- Profile updates
- Wallet tracking
- Statistics

---

## 🚀 Next Steps

**Phase 5:** Payment Integration (Razorpay)
**Phase 6:** Real-time tracking (Socket.io)
**Phase 7:** Image uploads (Multer)
**Phases 8-13:** Mobile app

---

**Ready to test the full backend API!** 🎉

All 24 endpoints are operational and waiting for your requests!
