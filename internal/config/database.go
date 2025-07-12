package config

import (
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"os"
)

func Init() *sqlx.DB {
	_ = godotenv.Load(".env")

	cfg := LoadConfig()
	db, err := sqlx.Connect("postgres", cfg.DSN())
	if err != nil {
		log.Error().Err(err).Msg("❌ Ошибка подключения к PostgreSQL")
		os.Exit(1)
	}

	if err := db.Ping(); err != nil {
		log.Error().Err(err).Msg("❌ PostgreSQL не отвечает")
		os.Exit(1)
	}

	log.Info().Msg("✅ Подключение к PostgreSQL успешно")
	return db
}
