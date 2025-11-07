# Running FarmShare Mobile App from AWS Cloud9

This guide will help you run the React Native mobile app on your Android phone while the code is hosted on AWS Cloud9.

## Prerequisites

- Android phone with **Expo Go** app installed (from Google Play Store)
- AWS Cloud9 environment (you're already here!)
- MongoDB running (local or cloud - we'll set this up)

---

## Part 1: Setup MongoDB

You have two options:

### Option A: Use MongoDB Atlas (Recommended for Cloud9)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Save this connection string - you'll need it in Step 3

### Option B: Use Local MongoDB (If installed)

```bash
# Check if MongoDB is installed
mongod --version

# If installed, start MongoDB
sudo service mongod start
```

---

## Part 2: Install Backend Dependencies & Configure

### Step 1: Install Backend Dependencies

```bash
cd /home/ec2-user/environment/temp/tractor-app/backend
npm install
```

This will take 2-3 minutes.

### Step 2: Configure Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit the .env file
nano .env
```

Update these values:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/tractor-app
# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/tractor-app

# Server Port
PORT=5000

# JWT Secret (use any random string)
JWT_SECRET=your-super-secret-key-here-change-this-123

# Test Mode (set to true for development without real SMS/Payments)
SMS_ENABLED=false
PAYMENT_ENABLED=false

# Twilio (Optional - leave empty for test mode)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Razorpay (Optional - leave empty for test mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Press `Ctrl+X`, then `Y`, then `Enter` to save**

### Step 3: Seed Database with Sample Data

```bash
node seed.js
```

This creates sample tractors and users for testing.

### Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

**Keep this terminal open!**

---

## Part 3: Make Backend Accessible from Mobile

Since you're on Cloud9 (remote server), your mobile can't access `localhost`. You need to expose the backend:

### Option 1: Use Cloud9 Preview URL (Easiest)

1. In Cloud9, go to **Preview** → **Preview Running Application**
2. You'll see a URL like: `https://xxxxx.vfs.cloud9.us-east-1.amazonaws.com`
3. Your backend is at: `https://xxxxx.vfs.cloud9.us-east-1.amazonaws.com:5000`
4. **Important**: Cloud9 might require you to append `:8080` or `:8081` to the URL

### Option 2: Use ngrok (More Reliable)

```bash
# Install ngrok
npm install -g ngrok

# In a NEW terminal (keep backend running), expose port 5000
ngrok http 5000
```

You'll get a URL like: `https://xxxx-xx-xxx-xxx.ngrok-free.app`

**Copy this URL - you'll need it for the mobile app!**

---

## Part 4: Setup and Run Mobile App

### Step 1: Install Mobile Dependencies

Open a **NEW terminal** (keep backend running):

```bash
cd /home/ec2-user/environment/temp/tractor-app/mobile
npm install
```

This will take 5-10 minutes.

### Step 2: Configure API URL

Edit the mobile app to point to your backend:

```bash
nano src/utils/constants.js
```

Find this line:

```javascript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://your-production-api.com/api';
```

Change it to:

```javascript
export const API_BASE_URL = 'https://YOUR_NGROK_URL/api';
// Example: 'https://abcd-12-34-56.ngrok-free.app/api'
// OR your Cloud9 URL: 'https://xxxxx.vfs.cloud9.us-east-1.amazonaws.com:5000/api'
```

**Press `Ctrl+X`, then `Y`, then `Enter` to save**

### Step 3: Start Expo Dev Server with Tunnel

```bash
npx expo start --tunnel
```

**Important**: Use `--tunnel` flag! This is required for Cloud9.

You'll see:
```
Metro waiting on exp://xxx.xxx.xxx.xxx:19000
Tunnel ready.
```

And a **QR Code** will appear in the terminal.

---

## Part 5: Run on Your Mobile

### Step 1: Open Expo Go App

Open the **Expo Go** app on your Android phone.

### Step 2: Scan QR Code

Two methods:

**Method A: Scan from Expo Go**
1. In Expo Go app, tap **"Scan QR code"**
2. Point camera at the QR code in your Cloud9 terminal

**Method B: Manual Entry**
1. If QR scan doesn't work, look for the URL in terminal:
   ```
   exp://xxx.tunnel.dev
   ```
2. In Expo Go, tap **"Enter URL manually"**
3. Type the URL from terminal

### Step 3: Wait for App to Load

- First time takes 1-2 minutes to build
- You'll see a white screen with "Loading..."
- Then the FarmShare app should appear!

---

## Testing the App

### Test Credentials (from seed.js)

**Farmers:**
- Phone: `8765432100` (or 8765432101, 8765432102, 8765432103, 8765432104)
- OTP: Any 6 digits (test mode - OTP is logged in backend terminal)

**Owners:**
- Phone: `9876543210` (or 9876543211, 9876543212, 9876543213, 9876543214)
- OTP: Any 6 digits

**Both:**
- You can test with either farmer or owner accounts
- Check backend terminal for the OTP code when you request it

---

## Troubleshooting

### Issue: "Network request failed"

**Solution**: Check API_BASE_URL in `mobile/src/utils/constants.js`
- Make sure it's the ngrok/Cloud9 URL (not localhost)
- Make sure backend is running
- Test backend by opening: `https://YOUR_URL/api/health` in browser

### Issue: "Can't connect to Expo"

**Solution**:
```bash
# Stop expo (Ctrl+C)
# Clear cache and restart with tunnel
npx expo start --tunnel --clear
```

### Issue: "Tunnel not working"

**Solution**: Use ngrok instead:
```bash
# In a new terminal
ngrok http 19000
# Use the ngrok URL for expo instead
```

### Issue: MongoDB connection failed

**Solution**:
- Check your MongoDB Atlas connection string
- Make sure you whitelisted your IP (or allow all: 0.0.0.0/0)
- Check MongoDB Atlas → Network Access

### Issue: "Expo Go shows error"

**Solution**:
```bash
# Check backend is running
curl https://YOUR_BACKEND_URL/api/health

# Restart everything:
# 1. Stop backend (Ctrl+C)
# 2. Stop expo (Ctrl+C)
# 3. Start backend: npm run dev
# 4. Start expo: npx expo start --tunnel
```

---

## Quick Reference Commands

**Terminal 1 - Backend:**
```bash
cd /home/ec2-user/environment/temp/tractor-app/backend
npm run dev
```

**Terminal 2 - ngrok (if using):**
```bash
ngrok http 5000
```

**Terminal 3 - Mobile:**
```bash
cd /home/ec2-user/environment/temp/tractor-app/mobile
npx expo start --tunnel
```

---

## Development Tips

1. **Hot Reload**: Changes to code automatically reload in Expo Go
2. **Shake Phone**: Shake your phone to open Expo menu (reload, debug, etc.)
3. **Check Logs**: Watch the Cloud9 terminals for errors
4. **Backend Logs**: Backend terminal shows all API calls and errors
5. **Test Mode**: SMS and Payments are in test mode (check backend logs for OTP)

---

## Next Steps After Setup

1. ✅ Language Selection (Hindi/English)
2. ✅ Phone Login (use test numbers above)
3. ✅ OTP Verification (check backend terminal for OTP)
4. ✅ Role Selection (Farmer/Owner/Both)
5. ✅ Explore the app!

**Farmers can:**
- Find nearby tractors on map
- Filter and search tractors
- Book tractors
- View booking history

**Owners can:**
- Add tractors
- Manage bookings (accept/reject)
- Track earnings
- View dashboard

---

## Support

If you face any issues:
1. Check all terminals for error messages
2. Verify backend URL in mobile/src/utils/constants.js
3. Make sure Expo Go app is updated
4. Try restarting everything (backend, expo, phone)

Good luck! 🚜📱
