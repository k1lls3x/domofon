package verification

// import (
// 	"context"
// 	"crypto/rand"
// 	"errors"
// 	"fmt"
// 	"time"
// )

// // Ошибка, когда токен для сброса невалиден
// var ErrInvalidResetToken = errors.New("invalid or expired reset token")

// // generate4DigitCode — тот же генератор 4-значного кода
// func generate4DigitCode() string {
// 	b := make([]byte, 2)
// 	_, _ = rand.Read(b)
// 	n := (uint(b[0])<<8 | uint(b[1])) % 10000
// 	return fmt.Sprintf("%04d", n)
// }

// // RequestPasswordResetByPhone — запрос кода сброса пароля на телефон.
// // Шаг 1 трёхшагового сброса:
// //  1) Проверяем, что пользователь существует.
// //  2) Генерируем и сохраняем одноразовый код в БД.
// //  3) Отправляем SMS.
// //  4) Помечаем телефон в кеше, чтобы в ResetPasswordByPhone можно было проверить верификацию.
// func (s *AuthService) RequestPasswordResetByPhone(ctx context.Context, phone string) error {
// 	// 1) Находим пользователя по телефону
// 	user, err := s.repo.GetUserByPhone(ctx, phone)
// 	if err != nil || user == nil {
// 		return errors.New("пользователь с таким телефоном не найден")
// 	}

// 	// 2) Генерируем код и сохраняем в БД (upsert)
// 	code := generate4DigitCode()
// 	expiresAt := time.Now().Add(5 * time.Minute)
// 	if err := s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expiresAt); err != nil {
// 		return err
// 	}

// 	// 3) Отправляем SMS
// 	if err := s.sms.SendSMS(phone, "Код для сброса пароля: "+code); err != nil {
// 		return err
// 	}

// 	// 4) Помечаем телефон как «верифицированный для сброса» на 5 минут
// 	s.markPhoneVerified(phone)
// 	return nil
// }

// // VerifyPhoneCode — проверяет код из SMS (шаг 2) и удаляет его из БД
// func (s *AuthService) VerifyPhoneCode(ctx context.Context, phone, code string) error {
// 	_, err := s.repo.GetPhoneVerificationToken(ctx, phone, code)
// 	if err != nil {
// 		return errors.New("invalid or expired code")
// 	}
// 	_ = s.repo.DeletePhoneVerificationToken(ctx, phone)
// 	// пометка в кеше уже сделана в RequestPasswordResetByPhone
// 	return nil
// }

// // ResetPasswordByPhone — финальный шаг (шаг 3): сброс пароля после верификации
// func (s *AuthService) ResetPasswordByPhone(ctx context.Context, phone, newPassword string) error {
// 	if !s.IsPhoneVerifiedForReset(ctx, phone) {
// 		return errors.New("телефон не подтверждён для сброса пароля")
// 	}
// 	user, err := s.repo.GetUserByPhone(ctx, phone)
// 	if err != nil || user == nil {
// 		return errors.New("пользователь не найден")
// 	}
// 	newHash, err := s.HashPassword(newPassword)
// 	if err != nil {
// 		return err
// 	}
// 	if err := s.repo.ChangePasswordByPhone(ctx, phone, newHash); err != nil {
// 		return err
// 	}
// 	// чистим метку верификации
// 	s.ClearPhoneVerifiedForReset(ctx, phone)
// 	return nil
// }

// func (s *AuthService) ResendPasswordResetCode(ctx context.Context, phone string) error {
// 	// Получаем последний токен по телефону
// 	token, err := s.repo.GetPhoneVerificationTokenByPhone(ctx, phone)
// 	if err == nil && token != nil {
// 		// Если еще не истекло 60 секунд с последней отправки — не отправляем
// 		if time.Since(token.CreatedAt) < time.Minute {
// 			return errors.New("повторная отправка доступна через минуту")
// 		}
// 	}

// 	// Если можно отправить — генерируем и отправляем код как обычно
// 	return s.RequestPasswordResetByPhone(ctx, phone)
// }

// // === Вспомогательные для сброса пароля ===

// func (s *AuthService) markPhoneVerified(phone string) {
// 	s.verifiedPhones.Store(phone, time.Now().Add(5*time.Minute))
// }

// func (s *AuthService) IsPhoneVerifiedForReset(ctx context.Context, phone string) bool {
// 	val, ok := s.verifiedPhones.Load(phone)
// 	if !ok {
// 		return false
// 	}
// 	exp, ok := val.(time.Time)
// 	if !ok || time.Now().After(exp) {
// 		s.verifiedPhones.Delete(phone)
// 		return false
// 	}
// 	return true
// }

// func (s *AuthService) ClearPhoneVerifiedForReset(ctx context.Context, phone string) {
// 	s.verifiedPhones.Delete(phone)
// }
// // === Отправка кода для регистрации ===

// func (s *AuthService) SendRegistrationCode(ctx context.Context, phone string) error {
// 	code := generate4DigitCode()
// 	expires := time.Now().Add(5 * time.Minute)
// 	if err := s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expires); err != nil {
// 		return err
// 	}
// 	return s.sms.SendSMS(phone, "Код для регистрации: "+code)
// }

// // === Отправка кода для сброса пароля ===

// func (s *AuthService) RequestPhoneVerification(ctx context.Context, phone string) error {
// 	// 1) Проверяем, что номер есть в базе
// 	user, err := s.repo.GetUserByPhone(ctx, phone)
// 	if err != nil || user == nil {
// 		return errors.New("пользователь с таким телефоном не найден")
// 	}

// 	// 2) Генерируем и сохраняем код
// 	code := generate4DigitCode()
// 	expires := time.Now().Add(5 * time.Minute)
// 	if err := s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expires); err != nil {
// 		return err
// 	}

// 	// 3) Отправляем SMS
// 	if err := s.sms.SendSMS(phone, "Код для сброса пароля: "+code); err != nil {
// 		return err
// 	}

// 	// 4) Отмечаем телефон как верифицированный для сброса (TTL 5 минут)
// 	s.markPhoneVerified(phone)
// 	return nil
// }
