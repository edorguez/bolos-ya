// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];
config.resolver.platforms = ['ios', 'android', 'web'];

// The ads SDK is native-only and its index eagerly imports a native RN internal
// that Metro refuses to bundle for web. Point web builds at the no-op stub.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-google-mobile-ads') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'ads.web.ts'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
