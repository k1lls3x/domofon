package http

import (
	"domofon/internal/auth"
	"domofon/internal/user"
	"domofon/internal/verification"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
		"domofon/internal/db"
		 httpSwagger "github.com/swaggo/http-swagger"
)

func NewRouter(pool *pgxpool.Pool) *mux.Router {
	// --- User ---
	userRepo := user.NewUserRepository(pool)
	userService := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userService)

	queries := db.New(pool)
  // Подключаем Swagger UI по пути /swagger/

	// Verification
	verifRepo := verification.NewRepository(queries)
	smsSender := &verification.MockSMSSender{}
	verifService := verification.NewService(
		verifRepo,
		smsSender,
		5*time.Minute,
		1*time.Minute,
	)

	// --- Auth ---
authRepo := auth.NewAuthRepository(pool)
	authService := auth.NewAuthService(authRepo, verifService)
	authHandler := auth.NewAuthHandler(authService)

	r := mux.NewRouter()
    r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
	// --- User routes ---
	r.HandleFunc("/users",      userHandler.GetUsers).Methods("GET")
	r.HandleFunc("/users",      userHandler.CreateUser).Methods("POST")
	r.HandleFunc("/users/{id}", userHandler.UpdateUser).Methods("PUT")
	r.HandleFunc("/users/{id}", userHandler.DeleteUser).Methods("DELETE")

	// --- Auth routes ---
	// Регистрация (трёхшагово):
	r.HandleFunc("/auth/request-registration-code", authHandler.RequestRegistrationCode).Methods("POST") // 1
	r.HandleFunc("/auth/verify-phone",              authHandler.VerifyPhone).Methods("POST")             // 2
	r.HandleFunc("/auth/register",                  authHandler.Register).Methods("POST")                // 3

	r.HandleFunc("/auth/login",                     authHandler.Login).Methods("POST")

	r.HandleFunc("/auth/change-password",           authHandler.ChangePassword).Methods("POST")

	// Сброс пароля (трёхшагово):
	r.HandleFunc("/auth/forgot-password",           authHandler.ForgotPassword).Methods("POST") // 1
	// step 2 — VerifyPhone (тот же endpoint)
	r.HandleFunc("/auth/reset-password",            authHandler.ResetPassword).Methods("POST")  // 3

	return r
}
