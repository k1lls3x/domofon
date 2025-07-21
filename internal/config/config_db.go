package config

import (
	"fmt"
	"os"
	"regexp"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Warn().Err(err).Msg("⚠️  Нет .env файла или не удалось загрузить")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")

	// Логируем значения (пароль маскируем)
	log.Info().
		Str("host", host).
		Str("port", port).
		Str("user", user).
		Str("password", mask(password)).
		Str("database", name).
		Msg("[config] Загружен конфиг из ENV/.env")

	// Проверка наличия всех параметров
	if host == "" || port == "" || user == "" || password == "" || name == "" {
		log.Error().Msg("❌ ВНИМАНИЕ: Не все параметры подключения к базе заполнены!")
	}

	return &Config{
		Host:     host,
		Port:     port,
		User:     user,
		Password: password,
		Name:     name,
	}
}

func (cfg *Config) DSN() string {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name,
	)
	log.Debug().Str("dsn", maskDSN(dsn)).Msg("[config] Сформирован DSN")
	return dsn
}

// Маскируем пароль в логах
func mask(s string) string {
	if len(s) <= 2 {
		return "**"
	}
	return s[:1] + "***" + s[len(s)-1:]
}

// Маскируем пароль в DSN при логировании
func maskDSN(dsn string) string {
	re := regexp.MustCompile(`password=[^ ]+`)
	return re.ReplaceAllString(dsn, "password=****")
}
