package config

import (
	"fmt"
	"os"
	"github.com/joho/godotenv"
	"log"
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

func LoadConfig() *Config {
	// Читаем .env, если есть (один раз, при старте)
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Нет .env файла или не удалось загрузить: ", err)
	}
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")

	return &Config{
		Host:     host,
		Port:     port,
		User:     user,
		Password: password,
		Name:     name,
	}
}

func (cfg *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name,
	)
}

