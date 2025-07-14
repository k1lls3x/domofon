package main

import (
	"net/http"
	"domofon/internal/config"
	"github.com/rs/zerolog/log"
	serverhttp "domofon/server/http"
)

func main() {
	config.SetupLogger()

	cfg := config.LoadConfig()
	pool := config.NewPgxPool(cfg)
	defer pool.Close()

	router := serverhttp.NewRouter(pool)

	log.Info().Msg("Server started at :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal().Err(err).Msg("Server stopped")
	}
}
