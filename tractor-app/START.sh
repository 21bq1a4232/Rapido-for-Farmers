#!/bin/bash

echo "🚀 FarmShare - Mobile App Quick Start"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  cd /home/ec2-user/environment/temp/tractor-app
fi

echo "📦 Step 1: Installing Backend Dependencies..."
cd backend
bun install

echo ""
echo "⚙️  Step 2: Setting up environment..."

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  cat > .env << 'EOL'
# MongoDB (use MongoDB Atlas URL or local)
MONGODB_URI=mongodb://localhost:27017/tractor-app

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=farmshare-secret-key-change-in-production-123456

# Test Mode (true = no real SMS/payments needed)
SMS_ENABLED=false
PAYMENT_ENABLED=false

# Twilio (leave empty for test mode)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Razorpay (leave empty for test mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
EOL
  echo "✅ Created .env file with test mode enabled"
else
  echo "✅ .env file already exists"
fi

echo ""
echo "📊 Step 3: Seeding database with sample data..."
node seed.js || echo "⚠️  Seeding failed - you may need MongoDB running"

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📱 Step 4: Installing Mobile Dependencies..."
cd ../mobile
bun install

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Start MongoDB (if using local):"
echo "   sudo service mongod start"
echo ""
echo "2. Start Backend (in Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "3. Expose Backend with ngrok (in Terminal 2):"
echo "   npm install -g ngrok"
echo "   ngrok http 5000"
echo "   (Copy the https URL shown)"
echo ""
echo "4. Update Mobile API URL:"
echo "   Edit: mobile/src/utils/constants.js"
echo "   Change API_BASE_URL to your ngrok URL + '/api'"
echo ""
echo "5. Start Mobile App (in Terminal 3):"
echo "   cd mobile && npx expo start --tunnel"
echo ""
echo "6. Scan QR code with Expo Go app on your phone!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Full guide: See MOBILE_SETUP_GUIDE.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
