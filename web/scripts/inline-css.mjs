import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const htmlPath = path.join(root, 'dist/index.html')

const html = await fs.readFile(htmlPath, 'utf8')
const match = html.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"/)

if (!match) {
  console.log('inline-css: no stylesheet link found, skipping')
} else {
  const cssPath = path.join(root, 'dist', match[1].replace(/^\//, ''))
  const css = await fs.readFile(cssPath, 'utf8')
  const inlined = html.replace(match[0], `<style>${css}</style>`)
  await fs.writeFile(htmlPath, inlined)
  await fs.unlink(cssPath)
  console.log(`inline-css: inlined ${match[1]} (${(css.length / 1024).toFixed(1)} KB)`)
}
