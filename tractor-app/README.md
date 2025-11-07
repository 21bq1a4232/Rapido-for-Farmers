# 🚜 Tractor Marketplace - "Tinder for Tractors"

A production-ready mobile application connecting farmers who need tractors with tractor owners for rental services. Built for rural India with Hindi/English support.

## 📱 Features

### For Farmers
- Find nearby tractors on interactive map
- View tractor details, pricing, and availability
- Book tractors by hour or acre
- Real-time tracking during work
- Secure wallet-based payments
- Rate and review tractor owners
- OTP-based work verification

### For Tractor Owners
- List multiple tractors with photos
- Set pricing (hourly/per acre)
- Accept/reject booking requests
- Track active bookings
- Receive payments securely (85% after 15% platform fee)
- Manage availability calendar
- Rate farmers

## 🛠 Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose (geospatial indexing)
- JWT Authentication
- Socket.io for real-time features
- Twilio for SMS OTP
- Razorpay for payments
- Multer for file uploads

**Mobile:**
- React Native (Expo managed workflow)
- Redux Toolkit for state management
- React Navigation 6
- React Native Maps
- Expo Location & Notifications
- Socket.io client

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   ```bash
   node --version  # Should be v16+
   ```

2. **MongoDB** (local installation or MongoDB Atlas account)
   - Local: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **Android Development Setup** (choose one):
   - **Physical Device:** Install [Expo Go](https://expo.dev/client) app from Google Play Store
   - **Emulator:** Install [Android Studio](https://developer.android.com/studio) and setup Android emulator

## 🚀 Quick Start Guide

### Step 1: Clone/Navigate to Project
```bash
cd tractor-app
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables (already done, but if needed)
cp .env.example .env

# Edit .env file with your configuration
# For development, default values work fine with local MongoDB

# Start MongoDB (if running locally)
# On macOS/Linux:
sudo systemctl start mongod
# OR
mongod

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend should now be running on `http://localhost:5000`

Test it:
```bash
curl http://localhost:5000/health
```

### Step 3: Mobile App Setup

```bash
# Navigate to mobile directory (from project root)
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Step 4: Run on Android

**Option A: Physical Device**
1. Install **Expo Go** from Google Play Store
2. Open Expo Go app
3. Scan the QR code shown in terminal
4. App will load on your device

**Option B: Android Emulator**
1. Start Android emulator from Android Studio
2. In terminal where `expo start` is running, press `a`
3. App will automatically open in emulator

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Tractors
- `POST /api/tractors` - Create tractor listing (owner only)
- `GET /api/tractors` - List all tractors
- `GET /api/tractors/nearby?lat=28.6&lng=77.2&radius=10` - Find nearby tractors
- `GET /api/tractors/:id` - Get tractor details
- `PUT /api/tractors/:id` - Update tractor
- `DELETE /api/tractors/:id` - Delete tractor
- `POST /api/tractors/:id/images` - Upload tractor images

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/accept` - Accept booking (owner)
- `PUT /api/bookings/:id/reject` - Reject booking (owner)
- `PUT /api/bookings/:id/start` - Start work with OTP
- `PUT /api/bookings/:id/complete` - Complete work with OTP
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/rate` - Rate after completion

### Payments
- `POST /api/payments/add-money` - Add money to wallet
- `POST /api/payments/verify` - Verify Razorpay payment
- `GET /api/payments/history` - Get payment history
- `POST /api/bookings/:id/pay` - Pay for booking from wallet

## 🔧 Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tractor-app

# JWT (change secret in production!)
JWT_SECRET=tractor-app-super-secret-key-2025-change-in-production
JWT_EXPIRES_IN=7d

# Twilio SMS (get from https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
SMS_ENABLED=false  # Keep false for development (OTP logs to console)

# Razorpay (get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_SECRET=your-secret
RAZORPAY_ENABLED=false  # Keep false for development (test mode)

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

### Mobile Configuration

Edit `mobile/app.json` to add Google Maps API key:

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

Get Google Maps API key from: https://console.cloud.google.com/

Update backend URL in `mobile/src/services/api.js` if deploying backend to cloud.

## 🧪 Testing

### Backend API Testing

Use Thunder Client (VS Code extension) or Postman:

**1. Test Health Check:**
```bash
GET http://localhost:5000/health
```

**2. Test OTP Send:**
```bash
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

Check backend console for OTP (since SMS_ENABLED=false)

**3. Test OTP Verify:**
```bash
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}
```

Save the returned JWT token for authenticated requests.

### Mobile App Testing

1. **Test on Physical Device:** Most accurate for GPS and sensors
2. **Test Language Switching:** Toggle between Hindi/English
3. **Test Location Permissions:** Grant when prompted
4. **Test Offline Behavior:** Turn off WiFi/data to see error messages

## 📦 Sample Data

The `seed.js` script creates:
- 5 tractor owners
- 10 tractors (various models and locations)
- Sample bookings

Run with: `npm run seed` from backend directory

**Test Credentials:**
- Phone: `9876543210`, `9876543211`, etc.
- OTP: `123456` (in development mode)

## 🏗 Building for Production

### Build Android APK

```bash
cd mobile

# Build APK
eas build --platform android --profile preview

# Or build locally (requires Android SDK)
expo build:android -t apk
```

### Deploy Backend

**Option 1: Railway.app (Recommended for beginners)**
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add MongoDB plugin
5. Add environment variables
6. Deploy!

**Option 2: DigitalOcean/AWS**
1. Create Ubuntu droplet/EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Run with PM2: `pm2 start server.js`
5. Setup nginx reverse proxy

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongosh  # Should connect

# Check if port 5000 is free
lsof -i :5000

# Check dependencies installed
npm install

# Check .env file exists
ls -la backend/.env
```

### Mobile app won't connect to backend
1. Make sure backend is running: `curl http://localhost:5000/health`
2. If using physical device: Update API URL to your computer's IP
   - Find IP: `ifconfig` (macOS/Linux) or `ipconfig` (Windows)
   - Update in `mobile/src/services/api.js`: `baseURL: 'http://192.168.1.x:5000'`
3. Ensure phone and computer on same WiFi network

### Expo Go errors
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update Expo
npm install expo@latest
```

### MongoDB connection errors
```bash
# Start MongoDB
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# View logs
sudo journalctl -u mongod
```

## 📖 Project Structure

```
tractor-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, errors
│   │   └── utils/           # Helper functions
│   ├── uploads/             # Uploaded images
│   ├── server.js            # Entry point
│   ├── seed.js              # Sample data
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable components
│   │   ├── navigation/      # React Navigation
│   │   ├── store/           # Redux Toolkit
│   │   ├── services/        # API client, Socket.io
│   │   └── utils/           # Helpers, i18n
│   ├── assets/              # Images, icons
│   ├── App.js               # Entry point
│   └── package.json
└── docs/
    └── plans/               # Implementation plan
```

## 🔐 Security Notes

⚠️ **For Development Only:**
- Default JWT secret is insecure - change in production
- SMS is disabled - enable Twilio for production
- Payments are in test mode - enable Razorpay for production
- CORS allows all origins - restrict in production

✅ **Before Production:**
1. Change JWT_SECRET to random 256-bit string
2. Enable and configure Twilio (SMS_ENABLED=true)
3. Enable Razorpay live mode (RAZORPAY_ENABLED=true)
4. Add HTTPS with SSL certificate
5. Setup CORS whitelist
6. Add rate limiting
7. Setup error tracking (Sentry)
8. Enable MongoDB authentication
9. Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review implementation plan in `docs/plans/`
3. Open an issue on GitHub

## 🗺 Roadmap

### Phase 1: ✅ Project Setup (Current)
### Phase 2: Database & Models (Next)
### Phase 3-16: See `docs/plans/2025-11-07-tractor-marketplace-plan.md`

---

Made with ❤️ for farmers in rural India
