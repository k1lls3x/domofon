package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
"golang.org/x/crypto/bcrypt"
	"domofon/internal/db"

)

// Интерфейс отправки SMS — удобно для тестов/замены сервиса
type SMSSender interface {
	SendSMS(toPhone, message string) error
}

var (
	ErrInvalidOldPassword = errors.New("invalid old password")
	ErrInvalidResetToken  = errors.New("invalid or expired reset token")
)

type AuthService struct {
	repo Auth
	sms  SMSSender
}

func NewAuthService(repo Auth, sms SMSSender) *AuthService {
	return &AuthService{repo: repo, sms: sms}
}

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

func (s *AuthService) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *AuthService) Register(ctx context.Context, params db.RegisterUserParams) error {
	return s.repo.RegisterUser(ctx, params)
}

func (s *AuthService) Authorize(ctx context.Context, username, password string) (*db.User, bool) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, false
	}
	ok := s.CheckPasswordHash(password, user.PasswordHash)
	return user, ok
}

func (s *AuthService) ChangePassword(ctx context.Context, username, oldPassword, newPassword string) error {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return err
	}
	if !s.CheckPasswordHash(oldPassword, user.PasswordHash) {
		return ErrInvalidOldPassword
	}
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.repo.ChangePassword(ctx, username, newHash)
}

// Генерация токена (32 hex символа)
func (s *AuthService) generateResetToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// Запрос сброса пароля по телефону — СМС с токеном
func (s *AuthService) RequestPasswordResetByPhone(ctx context.Context, phone string) error {
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {
		// Не палим, есть ли пользователь с этим телефоном
		return nil
	}
	token, err := s.generateResetToken()
	if err != nil {
		return err
	}
	expiresAt := time.Now().Add(30 * time.Minute)
	err = s.repo.CreatePasswordResetToken(ctx, int64(user.ID), token, expiresAt)
	if err != nil {
		return err
	}
	if user.Phone.Valid {
		_ = s.sms.SendSMS(user.Phone.String, "Код для сброса пароля: "+token)
	}
	return nil
}

// Сброс пароля по токену
func (s *AuthService) ResetPasswordByToken(ctx context.Context, token, newPassword string) error {
	user, err := s.repo.GetUserByResetToken(ctx, token)
	if err != nil || user == nil {
		return ErrInvalidResetToken
	}
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}
	err = s.repo.ChangePassword(ctx, user.Username, newHash)
	if err != nil {
		return err
	}
	return s.repo.InvalidateResetToken(ctx, token)
}
