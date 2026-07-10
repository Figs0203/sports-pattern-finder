-- Habilitar RLS en todas las tablas
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_bets ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Allow public read" ON leagues;
DROP POLICY IF EXISTS "Allow public read" ON teams;
DROP POLICY IF EXISTS "Allow public read" ON players;
DROP POLICY IF EXISTS "Allow public read" ON matches;
DROP POLICY IF EXISTS "Allow public read" ON odds;
DROP POLICY IF EXISTS "Allow public read" ON opportunities;
DROP POLICY IF EXISTS "Allow public read" ON strategies;
DROP POLICY IF EXISTS "Allow public read" ON backtest_bets;

-- Crear políticas de lectura pública para todos los usuarios (anon, authenticated)
CREATE POLICY "Allow public read" ON leagues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON odds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON opportunities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON strategies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON backtest_bets FOR SELECT TO anon, authenticated USING (true);
