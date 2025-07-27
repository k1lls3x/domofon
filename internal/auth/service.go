package auth

import (
	"context"
	"errors"
	"domofon/internal/db"
	"domofon/internal/verification"
	"golang.org/x/crypto/bcrypt"
	"time"
)

var (
	ErrInvalidOldPassword = errors.New("invalid old password")
	ErrInvalidResetToken  = errors.New("invalid or expired reset token")
	ErrPhoneTaken         = errors.New("пользователь с таким номером телефона уже существует")
	ErrUsernameTaken      = errors.New("пользователь с таким username уже существует")
	ErrEmailTaken         = errors.New("пользователь с такой почтой уже зарегистрирован")
)

type UserRepository interface {
	RegisterUser(ctx context.Context, params db.RegisterUserParams) error
	GetUserByPhone(ctx context.Context, phone string) (*db.User, error)
	ChangePasswordByPhone(ctx context.Context, phone, newHash string) error
	IsPhoneTaken(ctx context.Context, phone string) (bool, error)
	IsUsernameTaken(ctx context.Context, username string) (bool, error)
	IsEmailTaken(ctx context.Context, email string) (bool, error)
}

type AuthService struct {
	repo         UserRepository
	verification verification.Service
}

func NewAuthService(repo UserRepository, verification verification.Service) *AuthService {
	return &AuthService{
		repo:         repo,
		verification: verification,
	}
}

// Регистрация пользователя
func (s *AuthService) Register(ctx context.Context, params db.RegisterUserParams) error {
	phoneTaken, err := s.repo.IsPhoneTaken(ctx, params.Phone)
	if err != nil {
		return err
	}
	if phoneTaken {
		return ErrPhoneTaken
	}
	usernameTaken, err := s.repo.IsUsernameTaken(ctx, params.Username)
	if err != nil {
		return err
	}
	if usernameTaken {
		return ErrUsernameTaken
	}
	emailTaken, err := s.repo.IsEmailTaken(ctx, params.Email)
	if err != nil {
		return err
	}
	if emailTaken {
		return ErrEmailTaken
	}
	return s.repo.RegisterUser(ctx, params)
}

// Авторизация по телефону
func (s *AuthService) AuthorizeByPhone(ctx context.Context, phone, password string) (*db.User, bool) {
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {
		return nil, false
	}
	if !s.CheckPasswordHash(password, user.PasswordHash) {
		return nil, false
	}
	return user, true
}

// Проверка, занят ли телефон
func (s *AuthService) IsPhoneTaken(ctx context.Context, phone string) (bool, error) {
	return s.repo.IsPhoneTaken(ctx, phone)
}

// Проверка, занят ли username
func (s *AuthService) IsUsernameTaken(ctx context.Context, username string) (bool, error) {
	return s.repo.IsUsernameTaken(ctx, username)
}

// Смена пароля по телефону (с проверкой oldPassword)
func (s *AuthService) ChangePasswordByPhone(ctx context.Context, phone, oldPassword, newPassword string) error {
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {
		return ErrInvalidOldPassword
	}
	if !s.CheckPasswordHash(oldPassword, user.PasswordHash) {
		return ErrInvalidOldPassword
	}
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.repo.ChangePasswordByPhone(ctx, phone, newHash)
}

// Хеширование пароля
func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// Проверка пароля
func (s *AuthService) CheckPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// Отправка SMS-кода для регистрации
func (s *AuthService) SendRegistrationCode(ctx context.Context, phone string) error {
	phoneTaken, err := s.repo.IsPhoneTaken(ctx, phone)
	if err != nil {
		return err
	}
	if phoneTaken {
		return ErrPhoneTaken
	}
	return s.verification.SendVerificationCode(ctx, phone)
}

// Отправка кода сброса пароля
func (s *AuthService) RequestPasswordResetByPhone(ctx context.Context, phone string) error {
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {
		return errors.New("номер не найден")
	}
	return s.verification.SendVerificationCode(ctx, phone)
}

// Проверка SMS-кода (универсально — и для сброса, и для регистрации)
func (s *AuthService) VerifyPhoneCode(ctx context.Context, phone, code string) error {
	return s.verification.VerifyCode(ctx, phone, code)
}

// Сброс пароля после подтверждения по SMS
func (s *AuthService) ResetPasswordByPhone(ctx context.Context, phone, newPassword string) error {
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {
		return errors.New("пользователь не найден")
	}
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.repo.ChangePasswordByPhone(ctx, phone, newHash)
}

func (s *AuthService) SaveRefreshToken(ctx context.Context, userID int64, token, jti string, expiresAt time.Time) error {
    repo, ok := s.repo.(*AuthRepository)
    if !ok {
        return errors.New("репозиторий не поддерживает refresh-токены")
    }
    return repo.SaveRefreshToken(ctx, userID, token, jti, expiresAt)
}

func (s *AuthService) GetRefreshToken(ctx context.Context, token string) (*db.RefreshToken, error) {
    repo, ok := s.repo.(*AuthRepository)
    if !ok {
        return nil, errors.New("репозиторий не поддерживает refresh-токены")
    }
    return repo.GetRefreshToken(ctx, token)
}

func (s *AuthService) DeleteRefreshToken(ctx context.Context, token string) error {
    repo, ok := s.repo.(*AuthRepository)
    if !ok {
        return errors.New("репозиторий не поддерживает refresh-токены")
    }
    return repo.DeleteRefreshToken(ctx, token)
}
