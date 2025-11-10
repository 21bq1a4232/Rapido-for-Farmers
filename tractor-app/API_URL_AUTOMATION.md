# API URL Automation

This project includes an automated script to update the ngrok API URL dynamically, eliminating the need to manually change the URL in code every time you restart ngrok.

## Usage

### Method 1: Auto-detect ngrok URL (Recommended)
1. Start your ngrok tunnel (e.g., `ngrok http 5000`)
2. Run the auto-update command:
   ```bash
   cd mobile
   npm run auto-update-api
   ```

### Method 2: Specify URL manually
```bash
cd mobile
npm run update-api-url https://your-ngrok-url.ngrok-free.app
```

## How It Works

1. The script looks for the `NGROK_URL_PLACEHOLDER` in `mobile/src/utils/constants.js`
2. It replaces the URL with either:
   - The URL you provide as a parameter, OR
   - Automatically detected ngrok URL from ngrok's API endpoint
3. The script ensures the URL ends with `/api` suffix as expected by the app

## What's Included

- `mobile/scripts/update-api-url.js` - The update script
- Two npm scripts added to package.json:
  - `auto-update-api` - Automatically detects and updates with ngrok URL
  - `update-api-url` - Manually update with a specific URL

## Before Running

Make sure:
1. Your ngrok tunnel is running and accessible at `http://localhost:4040/api/tunnels`
2. You have started your backend server before starting ngrok
3. The ngrok URL is accessible (test it in your browser first)

## Example Workflow

```bash
# 1. Start your backend server
cd backend
npm start  # or bun start

# 2. In a separate terminal, start ngrok
ngrok http 5000

# 3. In another terminal, update the mobile app URL
cd mobile
npm run auto-update-api

# 4. Start the mobile app
npm start
```