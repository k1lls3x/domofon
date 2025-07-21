package config

import (
	"context"
	"time"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

func NewPgxPool(ctx context.Context, cfg *Config) (*pgxpool.Pool, error) {
	dsn := cfg.DSN()
	var pool *pgxpool.Pool
	var err error

	const maxAttempts = 3
	const delay = 2 * time.Second

	for i := 1; i <= maxAttempts; i++ {
		pool, err = pgxpool.New(ctx, dsn)
		if err == nil {
			log.Info().
				Str("host", cfg.Host).
				Str("port", cfg.Port).
				Str("database", cfg.Name).
				Int("attempt", i).
				Msg("✅ Connected to PostgreSQL")
			return pool, nil
		}

		log.Warn().
			Err(err).
			Int("attempt", i).
			Msg("❌ Failed to connect to PostgreSQL, retrying...")

		time.Sleep(delay)
	}

	log.Error().Err(err).Msg("🚨 Could not connect to PostgreSQL after retries")
	return nil, err
}
