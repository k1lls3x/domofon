package http

import (
	"github.com/gorilla/mux"
	"domofon/internal/repository"

	"domofon/internal/service"
	"domofon/server/http/handler"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(pool *pgxpool.Pool) *mux.Router {
	userRepo := repository.NewUserRepository(pool)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	authRepo := repository.NewAuthRepository(pool)
	authService := service.NewAuthService(authRepo)
	authHandler := handler.NewAuthHandler(authService)

	r := mux.NewRouter()

	// Пользовательские роуты
	r.HandleFunc("/users", userHandler.GetUsers).Methods("GET")
	r.HandleFunc("/users", userHandler.CreateUser).Methods("POST")
	r.HandleFunc("/users/{id}", userHandler.UpdateUser).Methods("PUT")
	r.HandleFunc("/users/{id}", userHandler.DeleteUser).Methods("DELETE")

	// Роуты авторизации
	r.HandleFunc("/auth/register", authHandler.Register).Methods("POST")
	r.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/auth/change-password", authHandler.ChangePassword).Methods("POST")

	return r
}
