package auth

import (
	"context"
	"domofon/internal/db"
	"errors"
	"sync"
	"golang.org/x/crypto/bcrypt"
	"time"
)

var (
	ErrInvalidOldPassword = errors.New("invalid old password")
)

type AuthService struct {
	repo Auth
	sms  SMSSender
	 verifiedPhones sync.Map
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


// Метод для добавления телефона с TTL (например 5 минут)
func (s *AuthService) markPhoneVerified(phone string) {
    s.verifiedPhones.Store(phone, time.Now().Add(5*time.Minute))
}

// Проверка, подтверждён ли телефон и не истёк ли TTL
func (s *AuthService) IsPhoneVerifiedForReset(ctx context.Context, phone string) bool {
    val, ok := s.verifiedPhones.Load(phone)
    if !ok {
        return false
    }
    expireTime, ok := val.(time.Time)
    if !ok {
        return false
    }
    if time.Now().After(expireTime) {
        s.verifiedPhones.Delete(phone)
        return false
    }
    return true
}

// Очистка телефона после сброса
func (s *AuthService) ClearPhoneVerifiedForReset(ctx context.Context, phone string) {
    s.verifiedPhones.Delete(phone)
}

func (s *AuthService) ResetPasswordByPhone(ctx context.Context, phone, newPassword string) error {
    if !s.IsPhoneVerifiedForReset(ctx, phone) {
        return errors.New("phone not verified for password reset")
    }

    user, err := s.repo.GetUserByPhone(ctx, phone)
    if err != nil || user == nil {
        return errors.New("user not found")
    }

    newHash, err := s.HashPassword(newPassword)
    if err != nil {
        return err
    }

    err = s.repo.ChangePasswordByPhone(ctx, phone, newHash)
    if err != nil {
        return err
    }

    s.ClearPhoneVerifiedForReset(ctx, phone)
    return nil
}
