-- GolValue Supabase Seed Data
-- Paste this script into the Supabase SQL Editor after executing schema.sql.

-- 1. Insert Leagues
INSERT INTO leagues (id, name, country, logo_url, season) VALUES
(39, 'Premier League', 'England', 'https://media.api-sports.io/football/leagues/39.png', 2026),
(140, 'La Liga', 'Spain', 'https://media.api-sports.io/football/leagues/140.png', 2026),
(135, 'Serie A', 'Italy', 'https://media.api-sports.io/football/leagues/135.png', 2026);

-- 2. Insert Teams
INSERT INTO teams (id, name, short_name, league_id, logo_url, attack_rating, defense_rating, avg_goals_for, avg_goals_against, avg_corners, avg_cards, form) VALUES
(50, 'Manchester City', 'MCI', 39, 'https://media.api-sports.io/football/teams/50.png', 1.95, 0.70, 2.45, 0.85, 6.20, 1.50, 'WDWWW'),
(42, 'Arsenal', 'ARS', 39, 'https://media.api-sports.io/football/teams/42.png', 1.75, 0.60, 2.10, 0.75, 5.90, 1.60, 'DWWWD'),
(40, 'Liverpool', 'LIV', 39, 'https://media.api-sports.io/football/teams/40.png', 1.80, 0.80, 2.20, 0.90, 6.10, 1.70, 'WWWDW'),
(541, 'Real Madrid', 'RMA', 140, 'https://media.api-sports.io/football/teams/541.png', 1.85, 0.80, 2.25, 0.95, 5.80, 1.80, 'WWDWD'),
(529, 'Barcelona', 'FCB', 140, 'https://media.api-sports.io/football/teams/529.png', 1.65, 0.90, 2.05, 1.05, 5.40, 2.10, 'WWLWW');

-- 3. Insert Players
INSERT INTO players (id, name, team_id, position, photo_url, age, appearances, goals, assists, avg_shots, avg_shots_on_target, avg_passes, avg_tackles, avg_fouls, yellow_cards, red_cards) VALUES
(1100, 'Erling Haaland', 50, 'Forward', 'https://media.api-sports.io/football/players/1100.png', 25, 28, 27, 5, 4.10, 2.30, 15.00, 0.20, 0.80, 2, 0),
(1101, 'Kevin De Bruyne', 50, 'Midfielder', 'https://media.api-sports.io/football/players/1101.png', 34, 22, 6, 14, 2.20, 1.10, 55.00, 1.10, 0.60, 3, 0),
(1200, 'Vinícius Júnior', 541, 'Forward', 'https://media.api-sports.io/football/players/1200.png', 25, 26, 15, 8, 3.20, 1.60, 28.00, 0.80, 1.20, 5, 0),
(1201, 'Jude Bellingham', 541, 'Midfielder', 'https://media.api-sports.io/football/players/1201.png', 22, 27, 19, 6, 2.50, 1.30, 48.00, 1.50, 1.40, 4, 0),
(1300, 'Bukayo Saka', 42, 'Forward', 'https://media.api-sports.io/football/players/1300.png', 24, 29, 16, 9, 2.80, 1.20, 35.00, 1.30, 0.90, 3, 0),
(1400, 'Mohamed Salah', 40, 'Forward', 'https://media.api-sports.io/football/players/1400.png', 33, 28, 18, 10, 3.50, 1.80, 30.00, 0.60, 0.50, 1, 0);

-- 4. Insert Matches
-- Need dynamically offset times so upcoming matches show up correctly in local timezone queries
INSERT INTO matches (id, league_id, home_team_id, away_team_id, kickoff, status, minute, home_goals, away_goals, stats) VALUES
(201, 39, 50, 42, now() + interval '1 day', 'upcoming', NULL, NULL, NULL, '{}'::jsonb),
(202, 140, 541, 529, now() - interval '60 minutes', 'live', 60, 2, 1, '{"corners":{"home":4,"away":3},"cards":{"home":1,"away":2},"shots":{"home":8,"away":6}}'::jsonb),
(203, 39, 40, 50, now() - interval '3 days', 'finished', NULL, 1, 1, '{"corners":{"home":5,"away":6},"cards":{"home":2,"away":1},"shots":{"home":12,"away":11}}'::jsonb),
(204, 39, 42, 40, now() + interval '3 days', 'upcoming', NULL, NULL, NULL, '{}'::jsonb);

-- 5. Insert Odds
INSERT INTO odds (match_id, bookmaker, market, selection, price, fair_price, updated_at) VALUES
(201, 'Consensus', '1x2', 'home', 1.850, 1.780, now()),
(201, 'Consensus', '1x2', 'draw', 3.600, 3.800, now()),
(201, 'Consensus', '1x2', 'away', 4.200, 4.500, now()),
(201, 'Consensus', 'over_under_2_5', 'over', 1.700, 1.620, now()),
(201, 'Consensus', 'over_under_2_5', 'under', 2.150, 2.300, now()),
(201, 'Consensus', 'btts', 'yes', 1.650, 1.580, now()),
(201, 'Consensus', 'btts', 'no', 2.200, 2.400, now()),
(204, 'Consensus', '1x2', 'home', 2.300, 2.200, now()),
(204, 'Consensus', '1x2', 'draw', 3.400, 3.500, now()),
(204, 'Consensus', '1x2', 'away', 3.100, 3.300, now());

-- 6. Insert Opportunities (signals)
INSERT INTO opportunities (match_id, player_id, category, market, selection, label, score, edge, model_prob, bookmaker_price, reasoning, created_at) VALUES
(201, 1100, 'player_shots', 'over_2_5_shots', 'over', 'Erling Haaland más de 2.5 disparos', 85.00, 12.50, 0.7250, 1.666, 'Haaland promedia 4.1 tiros por partido en casa y Arsenal concede 1.1 tiros a delanteros centro en sus salidas recientes.', now()),
(201, NULL, 'goals', 'over_2_5', 'over', 'Más de 2.5 goles', 72.00, 5.20, 0.6200, 1.750, 'Ambos equipos promedian una alta efectividad goleadora en partidos directos (promedio combinado de 3.1 goles esperados).', now()),
(204, 1400, 'player_shots', 'over_1_5_shots_on_target', 'over', 'Mohamed Salah más de 1.5 disparos a puerta', 88.00, 14.80, 0.6800, 1.880, 'Salah ha logrado 2 o más tiros a puerta en 9 de sus últimos 12 partidos como visitante.', now()),
(204, NULL, 'btts', 'yes', 'yes', 'Ambos equipos marcan', 76.00, 8.40, 0.6600, 1.720, 'Arsenal y Liverpool han cumplido el BTTS en el 80% de sus últimos enfrentamientos directos en el Emirates.', now());

-- 7. Insert Strategies for Backtesting
INSERT INTO strategies (id, name, description, category, min_score, min_edge, stake, created_at) VALUES
(1, 'Goles de Valor (Over 2.5)', 'Identifica partidos con cuotas de más de 2.5 goles subestimadas por el mercado.', 'goals', 70.00, 5.00, 1.50, now()),
(2, 'Tiros de Jugador Top', 'Encuentra valor en líneas de disparos de delanteros estrella frente a defensas débiles.', 'player_shots', 75.00, 8.00, 2.00, now());

-- 8. Insert Backtest Bets (historic settlements)
INSERT INTO backtest_bets (strategy_id, match_id, label, price, stake, score, edge, won, profit, settled_at) VALUES
(1, 203, 'Liverpool vs Man City - Más de 2.5 goles', 1.850, 1.50, 78.00, 9.20, false, -1.50, now() - interval '3 days'),
(2, 203, 'Erling Haaland más de 1.5 tiros a puerta', 1.720, 2.00, 82.00, 11.50, true, 1.44, now() - interval '3 days'),
(1, 203, 'Arsenal vs Chelsea - Más de 2.5 goles', 1.800, 1.50, 74.00, 6.50, true, 1.20, now() - interval '4 days'),
(2, 203, 'Mohamed Salah más de 2.5 disparos', 1.650, 2.00, 79.00, 9.80, true, 1.30, now() - interval '5 days');
