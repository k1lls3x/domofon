package http

import (
	"github.com/gorilla/mux"
	"domofon/internal/auth"
	"domofon/internal/sms"
	"domofon/internal/user"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(pool *pgxpool.Pool) *mux.Router {
	userRepo := user.NewUserRepository(pool)
	userService := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userService)

	authRepo := auth.NewAuthRepository(pool)
smsSender := &sms.MockSMSSender{}
authService := auth.NewAuthService(authRepo, smsSender)

	authHandler := auth.NewAuthHandler(authService)

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


	r.HandleFunc("/auth/forgot-password", authHandler.ForgotPassword).Methods("POST")
r.HandleFunc("/auth/reset-password", authHandler.ResetPassword).Methods("POST")

	return r
}
