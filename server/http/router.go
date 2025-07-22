package http

import (
	"domofon/internal/auth"
	"domofon/internal/user"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(pool *pgxpool.Pool) *mux.Router {
	userRepo := user.NewUserRepository(pool)
	userService := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userService)

	authRepo := auth.NewAuthRepository(pool)
	smsSender := &auth.MockSMSSender{}
	authService := auth.NewAuthService(authRepo, smsSender)

	authHandler := auth.NewAuthHandler(authService)

	r := mux.NewRouter()

	// Пользовательские роуты
// --- Пользовательские роуты ---
r.HandleFunc("/users",            userHandler.GetUsers).Methods("GET")
r.HandleFunc("/users",            userHandler.CreateUser).Methods("POST")
r.HandleFunc("/users/{id}",       userHandler.UpdateUser).Methods("PUT")
r.HandleFunc("/users/{id}",       userHandler.DeleteUser).Methods("DELETE")

// --- Роуты авторизации ---
// Регистрация (трёхшагово):
// 1) Получить код на свободный номер
r.HandleFunc("/auth/request-registration-code", authHandler.RequestRegistrationCode).Methods("POST")
// 2) Проверить код
r.HandleFunc("/auth/verify-phone",               authHandler.VerifyPhone).Methods("POST")
// 3) Создать учётку
r.HandleFunc("/auth/register",                   authHandler.Register).Methods("POST")

// Логин
r.HandleFunc("/auth/login",                      authHandler.Login).Methods("POST")

// Смена пароля внутри профиля
r.HandleFunc("/auth/change-password",            authHandler.ChangePassword).Methods("POST")

// Сброс пароля (трёхшагово):
// 1) Получить код на существующий номер
r.HandleFunc("/auth/forgot-password",            authHandler.ForgotPassword).Methods("POST")
// 2) Проверить код (тот же VerifyPhone)
 // уже объявлен выше
// 3) Сбросить пароль
r.HandleFunc("/auth/reset-password",             authHandler.ResetPassword).Methods("POST")

	return r
}
