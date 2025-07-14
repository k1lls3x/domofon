package service

import (
	"context"
	"errors"
	"domofon/internal/db"
	"domofon/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidOldPassword = errors.New("invalid old password")

type AuthService struct {
	repo repository.Auth
}

func NewAuthService(repo repository.Auth) *AuthService {
	return &AuthService{repo: repo}
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
