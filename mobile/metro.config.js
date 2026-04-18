// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Add web platform support for Metro
config.resolver = config.resolver || {}
config.resolver.platforms = ['ios', 'android', 'web']

module.exports = config
