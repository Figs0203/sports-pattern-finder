export function formatKickoff(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDay(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return "Hoy"
  if (d.toDateString() === tomorrow.toDateString()) return "Mañana"
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

// Deterministic crest color from a team id (HSL -> used inline).
export function crestColor(id: number): string {
  const hue = (id * 47) % 360
  return `hsl(${hue} 45% 42%)`
}
