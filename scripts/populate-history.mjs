async function populateHistory() {
  console.log("Iniciando la carga de datos históricos de los últimos 30 días...");
  
  // Create an array of the last 30 days
  const dates = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // We will only use api-football because The Odds API usually provides current/live odds
  // unless you use their specific historical endpoint (which is premium).
  // API-Football will give us the results of all past matches.
  
  for (const date of dates) {
    console.log(`Descargando partidos para la fecha: ${date}...`);
    try {
      const res = await fetch(`http://localhost:3000/api/sync?provider=api-football&date=${date}`);
      if (!res.ok) {
        console.error(`Error en ${date}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      console.log(`✅ ${date} - Insertados: ${data.fixtures} partidos, ${data.teams} equipos.`);
      
      // Esperar 1 segundo entre peticiones para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.error(`Error de red en ${date}:`, e.message);
    }
  }

  console.log("¡Carga histórica completada!");
}

populateHistory();
