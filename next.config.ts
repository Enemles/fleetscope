import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import type { NextConfig } from 'next'

// Pin le root workspace ici (un lockfile parasite plus haut fausse l'inférence de Next).
const root = dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: { root },
}

export default nextConfig
