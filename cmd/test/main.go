// @title Domofon API
// @version 1.0
// @description API для системы Домофон
// @host localhost:8080
// @BasePath /
package main

import (
	"net/http"
	"domofon/internal/config"
	"github.com/rs/zerolog/log"
	serverhttp "domofon/server/http"
	"context"
	 httpSwagger "github.com/swaggo/http-swagger"
	 _ "domofon/docs"
)

func main() {
	config.SetupLogger()

	cfg := config.LoadConfig()

	ctx := context.Background()
	pool, err := config.NewPgxPool(ctx, cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("Не удалось подключиться к базе")
	}
	defer pool.Close()

	router := serverhttp.NewRouter(pool)
router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
	log.Info().Msg("Server started at :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal().Err(err).Msg("Server stopped")
	}
}
