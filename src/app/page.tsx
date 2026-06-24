import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">fleetscope</h1>
        <p className="text-muted-foreground">
          Dashboard de télémétrie GPU temps réel — une étude du state React haute
          fréquence, du streaming WebSocket et du rendu haute densité.
        </p>
      </div>
      <Link
        href="/fleet"
        className="inline-flex w-fit items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Ouvrir le dashboard →
      </Link>
    </main>
  )
}
