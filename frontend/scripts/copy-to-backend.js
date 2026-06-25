import { existsSync, rmSync, cpSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const publicDir = join(__dirname, '..', '..', 'backend', 'public')

if (!existsSync(distDir)) {
  console.error('No existe frontend/dist. Ejecuta "npm run build" antes de copiar.')
  process.exit(1)
}

// Elimina los assets del build anterior para no dejar archivos con hash huérfanos
rmSync(join(publicDir, 'assets'), { recursive: true, force: true })

for (const entry of readdirSync(distDir)) {
  cpSync(join(distDir, entry), join(publicDir, entry), { recursive: true })
}

console.log('Build copiado a backend/public')
