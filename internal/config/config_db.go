package config

import (
	"fmt"
	"os"
)

var (
	BuildDBHost     string
	BuildDBPort     string
	BuildDBUser     string
	BuildDBPassword string
	BuildDBName     string
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

func LoadConfig() *Config {
	host := BuildDBHost
	if host == "" {
		host = os.Getenv("DB_HOST")
	}
	port := BuildDBPort
	if port == "" {
		port = os.Getenv("DB_PORT")
	}
	user := BuildDBUser
	if user == "" {
		user = os.Getenv("DB_USER")
	}
	password := BuildDBPassword
	if password == "" {
		password = os.Getenv("DB_PASSWORD")
	}
	name := BuildDBName
	if name == "" {
		name = os.Getenv("DB_NAME")
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
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name,
	)
}
