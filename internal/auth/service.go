package auth

import (
	"context"
	"domofon/internal/db"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidOldPassword = errors.New("invalid old password")
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

