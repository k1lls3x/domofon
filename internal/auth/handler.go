package auth

import (
	"domofon/internal/db"
	"encoding/json"
	"net/http"
_"errors"
	"github.com/jackc/pgx/v5/pgtype"
_	"context"
)

type AuthHandler struct {
	auth *AuthService
}

func NewAuthHandler(authService *AuthService) *AuthHandler {
	return &AuthHandler{auth: authService}
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
		PasswordHash: hashedPassword,
		Email:        pgtype.Text{String: req.Email, Valid: req.Email != ""},
		Phone:        pgtype.Text{String: req.Phone, Valid: req.Phone != ""},
		Role:         pgtype.Text{String: req.Role, Valid: req.Role != ""},
		IsActive:     pgtype.Bool{Bool: true, Valid: true},
		FirstName:    pgtype.Text{String: req.FirstName, Valid: req.FirstName != ""},
		LastName:     pgtype.Text{String: req.LastName, Valid: req.LastName != ""},
	}

	err = h.auth.Register(r.Context(), params)
	if err != nil {
		http.Error(w, "Ошибка регистрации пользователя: "+err.Error(), http.StatusInternalServerError)
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
	err := h.auth.ChangePasswordByPhone(r.Context(), req.Phone, req.OldPassword, req.NewPassword)
	if err != nil {
		http.Error(w, "Ошибка смены пароля: "+err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}
	_ = h.auth.RequestPasswordResetByPhone(r.Context(), req.Phone)

	w.WriteHeader(http.StatusOK)
}


func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	err := h.auth.ResetPasswordByPhone(r.Context(), req.Phone, req.NewPassword)
	if err != nil {
		http.Error(w, "Ошибка сброса пароля: "+err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}



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
	err := h.auth.VerifyPhoneCode(r.Context(), req.Phone, req.Code)
	if err != nil {
		http.Error(w, "Неверный или истёкший код", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}


func (h *AuthHandler) RequestPhoneVerification(w http.ResponseWriter, r *http.Request) {
	var req RequestPhoneVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}
	if req.Phone == "" {
		http.Error(w, "Требуется поле phone", http.StatusBadRequest)
		return
	}
	if err := h.auth.RequestPhoneVerification(r.Context(), req.Phone); err != nil {
		http.Error(w, "Ошибка отправки кода: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
