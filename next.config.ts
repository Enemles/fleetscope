import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import type { NextConfig } from 'next'

// Pin le root du workspace sur ce dossier : un lockfile parasite plus haut
// (~/pnpm-lock.yaml) faisait inférer à Next un mauvais root.
const root = dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: { root },
}

export default nextConfig
