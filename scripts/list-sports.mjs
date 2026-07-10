// Fetch available soccer sports from The Odds API
async function getSportsList() {
  const key = "63149c36d8bde781c3601d868101943f";
  const res = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${key}`);
  const data = await res.json();
  // Filter to soccer only
  const soccer = data.filter(s => s.group === "Soccer");
  console.log("Available soccer leagues:");
  soccer.forEach(s => console.log(`  ${s.key.padEnd(40)} ${s.title} (active: ${s.active})`));
}
getSportsList();
