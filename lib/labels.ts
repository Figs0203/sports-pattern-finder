export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    goals: "Goles",
    corners: "Córners",
    cards: "Tarjetas",
    shots: "Tiros",
    btts: "Ambos marcan",
    result: "Resultado",
    player_shots: "Tiros jugador",
  }
  return map[category] ?? category
}

export function positionLabel(position: string | null): string {
  const map: Record<string, string> = {
    GK: "Portero",
    DEF: "Defensa",
    MID: "Centrocampista",
    FWD: "Delantero",
  }
  return position ? map[position] ?? position : "—"
}
