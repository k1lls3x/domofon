package auth

import (
	"context"
	"crypto/rand"
	"errors"
	"time"
	"fmt"
)

var (
	ErrInvalidResetToken = errors.New("invalid or expired reset token")
)

// Генерация токена (32 hex символа)

// Запрос сброса пароля по телефону — СМС с токеном
func generate4DigitCode() string {
	b := make([]byte, 2)
	_, _ = rand.Read(b)
	n := (uint(b[0])<<8 | uint(b[1])) % 10000
	return fmt.Sprintf("%04d", n)
}

func (s *AuthService) RequestPasswordResetByPhone(ctx context.Context, phone string) error {
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {

		return nil
	}

	code := generate4DigitCode()
	expiresAt := time.Now().Add(5 * time.Minute)

	err = s.repo.CreatePasswordResetToken(ctx, int64(user.ID), code, expiresAt)
	if err != nil {
		return err
	}

	if user.Phone.Valid {
		message := "Код для сброса пароля: " + code
		_ = s.sms.SendSMS(user.Phone.String, message)
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
    user, err := s.repo.GetUserByPhone(ctx, phone)
    if err != nil || user == nil {
        // Можно вернуть ошибку или вернуть nil без отправки кода (по безопасности)
        return errors.New("Пользователь с таким телефоном не найден")
    }

    code := generate4DigitCode()
    expiresAt := time.Now().Add(5 * time.Minute)

    err = s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expiresAt)
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
    // Удаляем токен из БД, чтобы нельзя было использовать повторно
    _ = s.repo.DeletePhoneVerificationToken(ctx, phone)

    // Добавляем телефон в список подтверждённых на короткое время
    s.markPhoneVerified(phone)

    return nil
}
