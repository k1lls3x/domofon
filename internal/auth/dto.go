package auth

// --- Регистрация ---
type RegisterRequest struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Role      string `json:"role"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// --- Логин ---
type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

// --- Смена пароля ---
type ChangePasswordRequest struct {
	Phone       string `json:"phone"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// --- Сброс пароля ---
type ForgotPasswordRequest struct {
	Phone string `json:"phone"`
}

type ResetPasswordRequest struct {
    Phone       string `json:"phone"`
    NewPassword string `json:"newPassword"`
}
// --- Верификация номера ---
type RequestPhoneVerificationRequest struct {
	Phone string `json:"phone"`
}

type VerifyPhoneRequest struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}
// UserResponse описывает структуру JSON-ответа при успешной авторизации
type UserResponse struct {
    ID        int64  `json:"id"`
    Username  string `json:"username"`
    Email     string `json:"email"`
    Phone     string `json:"phone"`
    Role      string `json:"role"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
}
