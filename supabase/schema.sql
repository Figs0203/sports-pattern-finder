-- GolValue Supabase Schema Initialization
-- Paste this script into the Supabase SQL Editor to recreate the tables.

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS backtest_bets CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS odds CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;

-- 1. Leagues Table
CREATE TABLE leagues (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    logo_url TEXT,
    season INTEGER NOT NULL
);

-- 2. Teams Table
CREATE TABLE teams (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    league_id BIGINT REFERENCES leagues(id) ON DELETE SET NULL,
    logo_url TEXT,
    attack_rating NUMERIC(5, 2) DEFAULT 1.00,
    defense_rating NUMERIC(5, 2) DEFAULT 1.00,
    avg_goals_for NUMERIC(4, 2) DEFAULT 1.00,
    avg_goals_against NUMERIC(4, 2) DEFAULT 1.00,
    avg_corners NUMERIC(4, 2) DEFAULT 4.50,
    avg_cards NUMERIC(4, 2) DEFAULT 2.00,
    form TEXT DEFAULT 'W'
);

-- 3. Players Table
CREATE TABLE players (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    position TEXT,
    photo_url TEXT,
    age INTEGER,
    appearances INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    avg_shots NUMERIC(4, 2) DEFAULT 0.00,
    avg_shots_on_target NUMERIC(4, 2) DEFAULT 0.00,
    avg_passes NUMERIC(5, 2) DEFAULT 0.00,
    avg_tackles NUMERIC(4, 2) DEFAULT 0.00,
    avg_fouls NUMERIC(4, 2) DEFAULT 0.00,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0
);

-- 4. Matches Table
CREATE TABLE matches (
    id BIGINT PRIMARY KEY,
    league_id BIGINT REFERENCES leagues(id) ON DELETE SET NULL,
    home_team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    kickoff TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'finished')),
    minute INTEGER,
    home_goals INTEGER,
    away_goals INTEGER,
    stats JSONB DEFAULT '{}'::jsonb
);

-- 5. Odds Table
CREATE TABLE odds (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
    bookmaker TEXT NOT NULL,
    market TEXT NOT NULL,
    selection TEXT NOT NULL,
    price NUMERIC(6, 3) NOT NULL,
    fair_price NUMERIC(6, 3),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (match_id, bookmaker, market, selection)
);

-- 6. Opportunities Table
CREATE TABLE opportunities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
    player_id BIGINT REFERENCES players(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    market TEXT NOT NULL,
    selection TEXT NOT NULL,
    label TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    edge NUMERIC(5, 2) NOT NULL,
    model_prob NUMERIC(5, 4) NOT NULL,
    bookmaker_price NUMERIC(6, 3) NOT NULL,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Strategies Table
CREATE TABLE strategies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    min_score NUMERIC(5, 2) NOT NULL,
    min_edge NUMERIC(5, 2) NOT NULL,
    stake NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Backtest Bets Table
CREATE TABLE backtest_bets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    strategy_id BIGINT REFERENCES strategies(id) ON DELETE CASCADE,
    match_id BIGINT REFERENCES matches(id) ON DELETE SET NULL,
    label TEXT NOT NULL,
    price NUMERIC(6, 3) NOT NULL,
    stake NUMERIC(5, 2) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    edge NUMERIC(5, 2) NOT NULL,
    won BOOLEAN NOT NULL,
    profit NUMERIC(8, 2) NOT NULL,
    settled_at TIMESTAMPTZ DEFAULT now()
);

-- Create some helpful indexes for search queries
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_kickoff ON matches(kickoff);
CREATE INDEX idx_opportunities_score ON opportunities(score DESC);
CREATE INDEX idx_odds_match_id ON odds(match_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_teams_league_id ON teams(league_id);
