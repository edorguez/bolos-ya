// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Add web platform support for Metro
config.resolver = config.resolver || {}
config.resolver.platforms = ['ios', 'android', 'web']

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'pg') {
    return {
      filePath: path.join(__dirname, '.empty-modules/pg.js'),
      type: 'sourceFile',
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
