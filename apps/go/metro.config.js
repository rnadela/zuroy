const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SDK 54 auto-configures watchFolders for monorepos
// Enable package exports resolution
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
