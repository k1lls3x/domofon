package handler

import (
	"encoding/json"
	"net/http"
	"domofon/internal/db"
	"domofon/internal/service"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: authService}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type ChangePasswordRequest struct {
	Username    string `json:"username"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}
	if req.Password == "" {
		http.Error(w, "Пароль не может быть пустым", http.StatusBadRequest)
		return
	}

	hashedPassword, err := h.auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Ошибка хеширования пароля", http.StatusInternalServerError)
		return
	}

	params := db.RegisterUserParams{
    Username:     req.Username,
    PasswordHash: hashedPassword, // ← Обычный string!
    Email:        pgtype.Text{String: req.Email, Valid: req.Email != ""},
    Phone:        pgtype.Text{String: req.Phone, Valid: req.Phone != ""},
    Role:         pgtype.Text{String: req.Role, Valid: req.Role != ""},
    IsActive:     pgtype.Bool{Bool: true, Valid: true},
}



	err = h.auth.Register(r.Context(), params)
	if err != nil {
		http.Error(w, "Ошибка регистрации пользователя", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	user, ok := h.auth.Authorize(r.Context(), req.Username, req.Password)
	if !ok {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	err := h.auth.ChangePassword(r.Context(), req.Username, req.OldPassword, req.NewPassword)
	if err != nil {
		http.Error(w, "Ошибка смены пароля: "+err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
