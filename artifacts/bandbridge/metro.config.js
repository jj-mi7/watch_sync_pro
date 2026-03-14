const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

// CRITICAL FIX: Explicitly set the path for Expo Router 
// so pnpm symlinks don't break the resolution.
// If your app folder is inside src, change 'app' to 'src/app'
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(projectRoot, 'app');

const config = getDefaultConfig(projectRoot);

module.exports = config;