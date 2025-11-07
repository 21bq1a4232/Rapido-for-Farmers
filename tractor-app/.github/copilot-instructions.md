# 🚜 Tractor Marketplace AI Agent Instructions

## Project Overview

This is a dual-interface marketplace app connecting farmers with tractor owners in rural India. The system consists of a Node.js/Express backend and React Native mobile app with bilingual support (Hindi/English).

## Key Architecture Components

### Backend (`/backend`)

- **API Layer**: Express.js routes in `/backend/src/routes/` define RESTful endpoints
- **Authentication**: JWT-based with OTP verification (`/backend/src/middleware/auth.js`)
- **Data Models**: MongoDB schemas in `/backend/src/models/` with geospatial indexing
- **Business Logic**: Controllers in `/backend/src/controllers/` handle core operations
- **Services**: External integrations in `/backend/src/services/` (SMS, payments, location)

### Mobile App (`/mobile`)

- **Navigation**: Tab-based structure defined in `/mobile/src/navigation/`
- **State Management**: Redux slices in `/mobile/src/store/slices/`
- **Screens**: Role-specific views in `/mobile/src/screens/` (farmer/owner)
- **API Integration**: Centralized in `/mobile/src/services/api.js`

## Critical Workflows

### Development Setup

1. Backend requires MongoDB and Node.js v16+
2. Mobile app uses Expo managed workflow
3. Run backend first: `cd backend && npm install && npm run dev`
4. Run mobile: `cd mobile && npm install && expo start`

### Authentication Flow

1. OTP generation: `otpService.js` → SMS via Twilio
2. Verification: `authController.js` → JWT token generation
3. Protected routes use `auth.js` middleware

### Booking Flow

1. Location-based tractor search (`tractorController.js`)
2. Booking creation (`bookingController.js`)
3. Payment processing (`paymentService.js`)
4. Real-time updates via Socket.io

## Project Conventions

### API Patterns

- Protected routes use `auth` middleware
- Controllers follow service pattern for business logic
- Error handling via `errorHandler.js` middleware
- Validation schemas in `middleware/validation.js`

### State Management

- Redux slices for domain-specific state
- Async operations use Redux Toolkit's `createAsyncThunk`
- Example: `tractorSlice.js` for tractor CRUD operations

### Mobile Navigation

- Role-based navigation stacks (Farmer/Owner)
- Tab navigation for main flows
- Stack navigation for booking/details flows

## Integration Points

1. Payment Gateway: Razorpay integration in `paymentService.js`
2. SMS: Twilio integration in `smsService.js`
3. Maps: React Native Maps with custom markers
4. Real-time: Socket.io for booking updates

## Common Tasks

- Adding new API endpoint: Add route → controller → service → model
- New screen: Add to navigation → create screen → connect Redux
- Database seeding: Use `seed.js` script
- Testing API: Refer to `API_TESTING_GUIDE.md`

## Important Files

- `backend/src/config/database.js`: Database configuration
- `mobile/src/navigation/AppNavigator.js`: Main navigation structure
- `backend/src/middleware/auth.js`: Authentication middleware
- `mobile/src/services/api.js`: API client configuration
