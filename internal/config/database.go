package config

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

func NewPgxPool(cfg *Config) *pgxpool.Pool {
	dsn := cfg.DSN()
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal().Err(err).Msg("❌ Failed to connect to PostgreSQL")
	}
	log.Info().Msg("✅ Connected to PostgreSQL")
	return pool
}
