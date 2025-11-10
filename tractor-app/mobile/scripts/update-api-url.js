#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates the API_BASE_URL in constants.js file
 * @param {string} newUrl - The new ngrok URL to set
 */
function updateAPIUrl(newUrl) {
  try {
    // Validate URL format
    if (!newUrl || !newUrl.startsWith('http')) {
      console.error('Error: Invalid URL provided. URL must start with http:// or https://');
      process.exit(1);
    }

    // Ensure URL ends with '/api' suffix as expected by the app
    if (!newUrl.endsWith('/api')) {
      if (newUrl.endsWith('/')) {
        newUrl = newUrl + 'api';
      } else {
        newUrl = newUrl + '/api';
      }
    }

    const constantsPath = path.join(__dirname, '../src/utils/constants.js');
    let content = fs.readFileSync(constantsPath, 'utf8');

    // Find the line with the placeholder and replace the URL
    const placeholderPattern = /export const API_BASE_URL = 'https?:\/\/[^\s']+';\s*\/\/\s*NGROK_URL_PLACEHOLDER/;
    const currentUrlMatch = content.match(/export const API_BASE_URL = '([^']+)';\s*\/\/\s*NGROK_URL_PLACEHOLDER/);
    
    if (!currentUrlMatch) {
      console.error('Error: Could not find NGROK_URL_PLACEHOLDER in constants.js');
      process.exit(1);
    }

    const currentUrl = currentUrlMatch[1];
    content = content.replace(
      placeholderPattern,
      `export const API_BASE_URL = '${newUrl}';  // NGROK_URL_PLACEHOLDER`
    );

    fs.writeFileSync(constantsPath, content);
    
    console.log(`✅ API URL updated successfully!`);
    console.log(`🔄 Old URL: ${currentUrl}`);
    console.log(`🔄 New URL: ${newUrl}`);
  } catch (error) {
    console.error('Error updating API URL:', error.message);
    process.exit(1);
  }
}

/**
 * Extracts ngrok URL from ngrok API response
 */
async function getNgrokUrl() {
  try {
    // Try to get URLs from ngrok's API endpoint
    const ngrokApi = 'http://localhost:4040/api/tunnels';
    
    // Use a simple fetch implementation or child process to get ngrok URL
    const { execSync } = require('child_process');
    
    // Check if ngrok is running by trying to get the web interface
    try {
      // Try to get the ngrok tunnels information
      const result = execSync('curl -s http://localhost:4040/api/tunnels', { encoding: 'utf8' });
      const tunnels = JSON.parse(result);
      
      // Find the HTTPS tunnel
      const tunnel = tunnels.tunnels.find(t => t.proto === 'https');
      
      if (!tunnel) {
        console.error('Error: No HTTPS tunnel found. Make sure ngrok is running.');
        process.exit(1);
      }
      
      return tunnel.public_url;
    } catch (error) {
      console.error('Error: Could not connect to ngrok API. Make sure ngrok is running on port 4040.');
      console.error('Please start ngrok first, then run this script.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error getting ngrok URL:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage:');
    console.log('  node update-api-url.js <url>          # Set specific URL');
    console.log('  node update-api-url.js auto          # Auto-detect ngrok URL');
    console.log('');
    
    const choice = process.argv[2];
    if (choice === 'auto') {
      try {
        const ngrokUrl = await getNgrokUrl();
        updateAPIUrl(ngrokUrl);
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    } else {
      console.error('Please provide a URL or use "auto" for automatic detection');
      process.exit(1);
    }
  } else {
    const url = process.argv[2];
    if (url === 'auto') {
      try {
        const ngrokUrl = await getNgrokUrl();
        updateAPIUrl(ngrokUrl);
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    } else {
      updateAPIUrl(url);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateAPIUrl, getNgrokUrl };