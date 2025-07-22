package auth

import (
	_"context"
	"domofon/internal/db"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type AuthHandler struct {
	auth *AuthService
}

func NewAuthHandler(authService *AuthService) *AuthHandler {
	return &AuthHandler{auth: authService}
}

// POST /auth/register
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
		PasswordHash: hashedPassword,
		Email:        pgtype.Text{String: req.Email, Valid: req.Email != ""},
		Phone:        pgtype.Text{String: req.Phone, Valid: req.Phone != ""},
		Role:         pgtype.Text{String: req.Role, Valid: req.Role != ""},
		IsActive:     pgtype.Bool{Bool: true, Valid: true},
		FirstName:    pgtype.Text{String: req.FirstName, Valid: req.FirstName != ""},
		LastName:     pgtype.Text{String: req.LastName, Valid: req.LastName != ""},
	}

	// вызов регистрационного потока с проверками
	if err := h.auth.Register(r.Context(), params); err != nil {
		// бизнес-ошибки возвращаем 400
		if errors.Is(err, ErrPhoneTaken) || errors.Is(err, ErrUsernameTaken) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Ошибка регистрации пользователя: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
var (
  
    ErrUsernameTaken      = errors.New("пользователь с таким username уже существует")
    ErrPhoneTaken         = errors.New("пользователь с таким номером телефона уже существует")
)

// POST /auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}
	if req.Phone == "" {
		http.Error(w, "Требуется поле phone", http.StatusBadRequest)
		return
	}

	user, ok := h.auth.AuthorizeByPhone(r.Context(), req.Phone, req.Password)
	if !ok {
		http.Error(w, "Неверный телефон или пароль", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// POST /auth/change-password
func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}
	if req.Phone == "" {
		http.Error(w, "Требуется поле phone", http.StatusBadRequest)
		return
	}

	if err := h.auth.ChangePasswordByPhone(r.Context(), req.Phone, req.OldPassword, req.NewPassword); err != nil {
		http.Error(w, "Ошибка смены пароля: "+err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// POST /auth/request-registration-code
func (h *AuthHandler) RequestRegistrationCode(w http.ResponseWriter, r *http.Request) {
	var req RequestPhoneVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Проверяем, что номер ещё не занят
	taken, err := h.auth.IsPhoneTaken(r.Context(), req.Phone)
	if err != nil {
		http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		return
	}
	if taken {
		http.Error(w, "Аккаунт с этим номером уже существует", http.StatusBadRequest)
		return
	}

	// Отправляем код регистрации
	if err := h.auth.SendRegistrationCode(r.Context(), req.Phone); err != nil {
		http.Error(w, "Не удалось отправить код", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// POST /auth/forgot-password
func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Отправляем код сброса, или 400 если номер не в базе
	if err := h.auth.RequestPasswordResetByPhone(r.Context(), req.Phone); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// POST /auth/verify-phone
func (h *AuthHandler) VerifyPhone(w http.ResponseWriter, r *http.Request) {
	var req VerifyPhoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}
	if req.Phone == "" || req.Code == "" {
		http.Error(w, "Требуются поля phone и code", http.StatusBadRequest)
		return
	}

	if err := h.auth.VerifyPhoneCode(r.Context(), req.Phone, req.Code); err != nil {
		http.Error(w, "Неверный или истёкший код", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// POST /auth/reset-password
func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	if err := h.auth.ResetPasswordByPhone(r.Context(), req.Phone, req.NewPassword); err != nil {
		http.Error(w, "Ошибка сброса пароля: "+err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
