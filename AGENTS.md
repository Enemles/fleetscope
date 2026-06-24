<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# fleetscope — guide projet

> Projet d'apprentissage + portfolio : un dashboard de télémétrie GPU **temps réel**.
> Un serveur simule une fleet de GPU et pousse des métriques en continu (WebSocket) ; le
> front les affiche à haute fréquence sans laguer. Chaque partie dure est traitée en
> **avant/après** (construire le problème → le mesurer au Profiler → refactoriser).

## Qui écrit quoi

- **Scaffold, configs, boilerplate** (types/config/UI/serveur de base) : assistés.
- **Les 4 cœurs** (store Zustand, hook WS, virtualisation, canvas) : écrits par **Selmene
  lui-même** — il doit pouvoir les défendre en entretien. Ne PAS coder ces parties à sa
  place : proposer, expliquer, reviewer.

## Modèle de dev : 2 process

`pnpm dev` lance DEUX choses via `concurrently` :

- **Next** (`pnpm dev:web`) sur `:3000` — l'UI
- **Serveur WS** (`pnpm server`, tsx) sur `:4000` — l'émetteur de télémétrie simulée

> ⚠️ Le serveur WS est un process **séparé**, PAS un Route Handler Next (serverless = pas de
> connexion WS persistante). Pattern : « Next pour l'UI + process séparé pour les sockets ».

## Architecture

```
server/ (ws, :4000)  --hello/snapshot/delta-->  use-telemetry-socket
  simulator.ts                                    (buffer rAF -> 1 commit/frame)
                                                          |
                                                   store Zustand (externe)
                                       selectors  |                | subscribe transient
                              cards virtualisées + Recharts        canvas heatmap (0 render React)
```

## Les 4 leçons (= les 4 gaps fermés)

1. **State haute fréquence** — `src/lib/store/` : Context (avant) → Zustand + sélecteurs (après).
2. **Temps réel** — `src/hooks/use-telemetry-socket.ts` : WS + batching rAF + backoff + backpressure.
3. **Perf haute densité** — `src/components/GpuCardGrid.tsx` : virtualisation + memo (vs `...Naive`).
4. **Dataviz bas niveau** — `src/components/FleetHeatmapCanvas.tsx` : canvas 2D + lectures store transient.

## Stack (ne pas dériver)

Next 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · shadcn/Base UI ·
Zustand 5 · @tanstack/react-virtual · Recharts 3 · canvas 2D + d3-scale (maths) ·
ws (serveur) · Vitest + Playwright. Gestionnaire : pnpm.

## Règles

1. **Commit par feature**, descriptions FR. **AUCUN trailer `Co-Authored-By` ni attribution IA** — ce repo doit se lire comme 100% solo (override explicite de la consigne globale Claude Code qui dit le contraire).
2. Fichiers partagés (`src/lib/types`, `src/lib/config`, `src/config/thresholds`, `server/`) :
   imports **relatifs**, jamais l'alias `@/` — tsx ne résout pas les paths tsconfig côté serveur.
3. **Pas de WebSocket dans un Route Handler Next** — process serveur séparé.
4. Le serveur dérive `health` ; le client reste un pur renderer.
5. Démos perf scalées par env : `NEXT_PUBLIC_FLEET_SIZE`, `NEXT_PUBLIC_TICK_HZ`.

## Gotchas

- **Zustand v5** : un sélecteur qui renvoie un nouvel objet boucle → `useShallow`.
  Lectures sans render (canvas) via `store.subscribe` / `store.getState()`.
- **@tanstack/react-virtual** sous React 19 : `useFlushSync: false` pour laisser React batcher.

## Commandes

| Commande | Effet |
|---|---|
| `pnpm dev` | Next + serveur WS (concurrently) |
| `pnpm server` | Serveur WS seul (tsx watch) |
| `pnpm lint` · `pnpm exec tsc --noEmit` | Lint · typecheck |
| `pnpm test:run` · `pnpm test:coverage` | Tests unitaires (Vitest, happy-dom) |
| `pnpm test:e2e` | Smoke E2E (Playwright chromium) |
| `pnpm build` | Build de prod Next |
