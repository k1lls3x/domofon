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

// Register godoc
// @Summary Регистрация нового пользователя
// @Description Создает нового пользователя по данным (телефон, имя, email и т.д.)
// @Tags auth
// @Accept json
// @Produce json
// @Param input body RegisterRequest true "Данные для регистрации"
// @Success 201 "Пользователь успешно создан"
// @Failure 400 {string} string "Некорректный JSON/пароль/номер занят"
// @Failure 500 {string} string "Ошибка сервера"
// @Router /auth/register [post]
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
    Email:        req.Email,
    Phone:        req.Phone,
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

// Login godoc
// @Summary Вход по номеру телефона и паролю
// @Description Авторизация пользователя по телефону и паролю
// @Tags auth
// @Accept json
// @Produce json
// @Param input body auth.LoginRequest true "Данные для входа"
// @Success 200 {object} auth.UserResponse "Пользователь авторизован"
// @Failure 400 {string} string "Некорректный JSON"
// @Failure 401 {string} string "Неверный телефон или пароль"
// @Router /auth/login [post]
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

// ChangePassword godoc
// @Summary Смена пароля по телефону
// @Description Смена пароля с проверкой старого пароля
// @Tags auth
// @Accept json
// @Produce json
// @Param input body ChangePasswordRequest true "Данные для смены пароля"
// @Success 200 "Пароль успешно изменён"
// @Failure 400 {string} string "Ошибка смены пароля"
// @Router /auth/change-password [post]
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

// RequestRegistrationCode godoc
// @Summary Запросить код для регистрации
// @Description Отправляет код подтверждения на номер для регистрации
// @Tags auth
// @Accept json
// @Produce json
// @Param input body RequestPhoneVerificationRequest true "Номер телефона"
// @Success 200 "Код отправлен"
// @Failure 400 {string} string "Аккаунт с этим номером уже существует"
// @Failure 500 {string} string "Ошибка сервера"
// @Router /auth/request-registration-code [post]
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

// ForgotPassword godoc
// @Summary Запросить сброс пароля
// @Description Отправляет SMS-код для сброса пароля по телефону
// @Tags auth
// @Accept json
// @Produce json
// @Param input body ForgotPasswordRequest true "Номер телефона"
// @Success 200 "Код сброса отправлен"
// @Failure 400 {string} string "Номер не найден"
// @Router /auth/forgot-password [post]
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

// VerifyPhone godoc
// @Summary Подтвердить номер телефона
// @Description Проверка кода, отправленного на телефон (регистрация/восстановление)
// @Tags auth
// @Accept json
// @Produce json
// @Param input body VerifyPhoneRequest true "Телефон и код"
// @Success 200 "Код успешно подтверждён"
// @Failure 400 {string} string "Неверный или истёкший код"
// @Router /auth/verify-phone [post]
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

// ResetPassword godoc
// @Summary Сброс пароля по телефону
// @Description Установка нового пароля по телефону после проверки кода
// @Tags auth
// @Accept json
// @Produce json
// @Param input body ResetPasswordRequest true "Телефон и новый пароль"
// @Success 200 "Пароль успешно сброшен"
// @Failure 400 {string} string "Ошибка сброса пароля"
// @Router /auth/reset-password [post]
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
