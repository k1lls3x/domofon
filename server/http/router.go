package http

import (
	"domofon/internal/auth"
	"domofon/internal/user"
	"domofon/internal/verification"
	"domofon/internal/db"
	"domofon/internal/middleware"
	"net/http"
	"time"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	httpSwagger "github.com/swaggo/http-swagger"
)

func NewRouter(pool *pgxpool.Pool) *mux.Router {
	// --- User ---
	userRepo := user.NewUserRepository(pool)
	userService := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userService)

	queries := db.New(pool)

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

	// --- Открытые ручки ---
	// Регистрация (трёхшагово):
	r.HandleFunc("/auth/request-registration-code", authHandler.RequestRegistrationCode).Methods("POST")
	r.HandleFunc("/auth/verify-phone",              authHandler.VerifyPhone).Methods("POST")
	r.HandleFunc("/auth/register",                  authHandler.Register).Methods("POST")
	r.HandleFunc("/auth/login",                     authHandler.Login).Methods("POST")
	r.HandleFunc("/auth/forgot-password",           authHandler.ForgotPassword).Methods("POST")
	r.HandleFunc("/auth/reset-password",            authHandler.ResetPassword).Methods("POST")
	r.HandleFunc("/users",                          userHandler.CreateUser).Methods("POST")
	r.HandleFunc("/auth/refresh", authHandler.Refresh).Methods("POST")
	r.HandleFunc("/auth/logout", authHandler.Logout).Methods("POST")

	// --- Защищённые ручки (JWT Auth) ---
	protected := r.PathPrefix("").Subrouter()
	protected.Use(middleware.JWTAuth)

	// User endpoints
	protected.HandleFunc("/users/me", userHandler.GetCurrentUser).Methods("GET")
	protected.HandleFunc("/users",      userHandler.GetUsers).Methods("GET")
	protected.HandleFunc("/users/{id}", userHandler.UpdateUser).Methods("PUT")
	protected.HandleFunc("/users/{id}", userHandler.DeleteUser).Methods("DELETE")
	protected.HandleFunc("/users/me/avatar", userHandler.UploadAvatar).Methods("POST")
	protected.HandleFunc("/users/me/avatar", userHandler.DeleteAvatar).Methods("DELETE")
	protected.HandleFunc("/users/me/username", userHandler.ChangeUsername).Methods("POST")
	protected.HandleFunc("/users/me/fullname", userHandler.UpdateFullName).Methods("POST")
	protected.HandleFunc("/users/me/email", userHandler.UpdateEmail).Methods("POST")

avatarHandler := http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads")))
r.PathPrefix("/uploads/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

    w.Header().Set("Cache-Control", "public, max-age=604800")
    avatarHandler.ServeHTTP(w, r)
}))



	protected.HandleFunc("/auth/change-password", authHandler.ChangePassword).Methods("POST")

	return r
}
