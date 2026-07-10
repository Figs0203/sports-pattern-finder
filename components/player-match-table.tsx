import { formatKickoff } from "@/lib/format"
import type { PlayerMatchLog } from "@/lib/player-history"

const cols = [
  { key: "date", label: "Fecha", align: "left" },
  { key: "opponent", label: "Rival", align: "left" },
  { key: "minutes", label: "Min", align: "right" },
  { key: "shots", label: "Tiros", align: "right" },
  { key: "shotsOnTarget", label: "S/Arco", align: "right" },
  { key: "goals", label: "Goles", align: "right" },
  { key: "assists", label: "Asis.", align: "right" },
  { key: "passes", label: "Pases", align: "right" },
  { key: "fouls", label: "Faltas", align: "right" },
] as const

function cellValue(log: PlayerMatchLog, key: (typeof cols)[number]["key"]): string {
  if (key === "date") return formatKickoff(log.date).split(" ")[0]
  return String(log[key as keyof PlayerMatchLog])
}

function highlight(log: PlayerMatchLog, key: (typeof cols)[number]["key"]): string {
  if (key === "goals" && log.goals >= 1) return "text-primary font-semibold"
  if (key === "shotsOnTarget" && log.shotsOnTarget >= 2) return "text-primary font-semibold"
  if (key === "shots" && log.shots >= 3) return "text-warning font-semibold"
  if (key === "assists" && log.assists >= 1) return "text-primary font-semibold"
  return ""
}

export function PlayerMatchTable({ logs }: { logs: PlayerMatchLog[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {cols.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr
              key={log.index}
              className="transition-colors hover:bg-accent/30"
            >
              {cols.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-2.5 font-mono tabular-nums ${
                    c.align === "right" ? "text-right" : "text-left"
                  } ${highlight(log, c.key)}`}
                >
                  {cellValue(log, c.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
