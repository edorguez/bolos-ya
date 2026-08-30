import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { promises as fs } from 'node:fs'

const assetsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/assets')

// Display sizes: hero ≤240px, feature panels ≤360px wide / 192px tall, logo 73x28.
// WebP at 2x retina keeps them crisp while cutting file size dramatically.
const targets = [
  { src: 'merki-illustration.png', out: 'merki-illustration.webp', width: 480 },
  { src: 'merki-scan.png', out: 'merki-scan.webp', width: 720 },
  { src: 'merki-checkout.png', out: 'merki-checkout.webp', width: 720 },
  { src: 'merki-calculator.png', out: 'merki-calculator.webp', width: 600 },
  { src: 'merki-logo.png', out: 'merki-logo.webp', width: 300 },
]

for (const t of targets) {
  const input = path.join(assetsDir, t.src)
  const output = path.join(assetsDir, t.out)
  await sharp(input)
    .resize({ width: t.width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(output)
  const size = (await fs.stat(output)).size
  console.log(`${t.out.padEnd(26)} ${(size / 1024).toFixed(1).padStart(8)} KB`)
}
