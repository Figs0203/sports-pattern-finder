import { PageHeader } from "@/components/page-header"
import { PlayersGrid } from "@/components/players-grid"
import { getPlayers } from "@/lib/data"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Jugadores — GolValue",
  description: "Analiza el rendimiento individual de jugadores y descubre patrones estadísticos en sus últimos partidos.",
}

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <>
      <PageHeader
        title="Jugadores"
        description={`${players.length} jugadores · Selecciona uno para ver su historial y patrones`}
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <PlayersGrid players={players} />
      </div>
    </>
  )
}
