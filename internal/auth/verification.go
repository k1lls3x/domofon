package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
	"fmt"
)

var (
	ErrInvalidResetToken = errors.New("invalid or expired reset token")
)

// Генерация токена (32 hex символа)
func (s *AuthService) generateResetToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// Сгенерировать 6-значный код, всегда 6 цифр (с ведущими нулями)
func generate6DigitCode() string {
	b := make([]byte, 3)
	_, _ = rand.Read(b)
	n := (uint(b[0])<<16 | uint(b[1])<<8 | uint(b[2])) % 1000000
	return fmt.Sprintf("%06d", n)
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
	err = s.repo.ChangePasswordByPhone(ctx, user.Username, newHash)
	if err != nil {
		return err
	}
	return s.repo.InvalidateResetToken(ctx, token)
}

func (s *AuthService) RequestPhoneVerification(ctx context.Context, phone string) error {
	code := generate6DigitCode() // например, "123456"
	expiresAt := time.Now().Add(5 * time.Minute)
	err := s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expiresAt)
	if err != nil {
		return err
	}
	return s.sms.SendSMS(phone, "Ваш код подтверждения: "+code)
}

func (s *AuthService) VerifyPhoneCode(ctx context.Context, phone, code string) error {
	_, err := s.repo.GetPhoneVerificationToken(ctx, phone, code)
	if err != nil {
		return errors.New("invalid or expired code")
	}
	_ = s.repo.DeletePhoneVerificationToken(ctx, phone) // Удаляем, чтобы не использовать повторно
	return nil
}
