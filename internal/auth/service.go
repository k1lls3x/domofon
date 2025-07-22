package auth

import (
	"context"

	"errors"

	"domofon/internal/db"
	"golang.org/x/crypto/bcrypt"
	"sync"
	"time"
)

var (
	ErrInvalidOldPassword = errors.New("invalid old password")
)

// AuthService хранит репозиторий и SMS-шлюз
type AuthService struct {
	repo            Auth
	sms             SMSSender
	verifiedPhones  sync.Map
}

func NewAuthService(repo Auth, sms SMSSender) *AuthService {
	return &AuthService{repo: repo, sms: sms}
}

// === Хеширование пароля ===

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

func (s *AuthService) CheckPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// === Регистрация ===

func (s *AuthService) Register(ctx context.Context, params db.RegisterUserParams) error {
	phoneTaken, err := s.IsPhoneTaken(ctx, params.Phone.String)
	if err != nil {
		return err
	}
	if phoneTaken {
		return errors.New("пользователь с таким номером телефона уже существует")
	}

	usernameTaken, err := s.IsUsernameTaken(ctx, params.Username)
	if err != nil {
		return err
	}
	if usernameTaken {
		return errors.New("пользователь с таким username уже существует")
	}

	return s.repo.RegisterUser(ctx, params)
}

func (s *AuthService) IsPhoneTaken(ctx context.Context, phone string) (bool, error) {
	return s.repo.IsPhoneTaken(ctx, phone)
}

func (s *AuthService) IsUsernameTaken(ctx context.Context, username string) (bool, error) {
	return s.repo.IsUsernameTaken(ctx, username)
}

// === Логин / смена пароля внутри профиля ===

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

// === Вспомогательные для сброса пароля ===

func (s *AuthService) markPhoneVerified(phone string) {
	s.verifiedPhones.Store(phone, time.Now().Add(5*time.Minute))
}

func (s *AuthService) IsPhoneVerifiedForReset(ctx context.Context, phone string) bool {
	val, ok := s.verifiedPhones.Load(phone)
	if !ok {
		return false
	}
	exp, ok := val.(time.Time)
	if !ok || time.Now().After(exp) {
		s.verifiedPhones.Delete(phone)
		return false
	}
	return true
}

func (s *AuthService) ClearPhoneVerifiedForReset(ctx context.Context, phone string) {
	s.verifiedPhones.Delete(phone)
}
// === Отправка кода для регистрации ===

func (s *AuthService) SendRegistrationCode(ctx context.Context, phone string) error {
	code := generate4DigitCode()
	expires := time.Now().Add(5 * time.Minute)
	if err := s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expires); err != nil {
		return err
	}
	return s.sms.SendSMS(phone, "Код для регистрации: "+code)
}

// === Отправка кода для сброса пароля ===

func (s *AuthService) RequestPhoneVerification(ctx context.Context, phone string) error {
	// 1) Проверяем, что номер есть в базе
	user, err := s.repo.GetUserByPhone(ctx, phone)
	if err != nil || user == nil {
		return errors.New("пользователь с таким телефоном не найден")
	}

	// 2) Генерируем и сохраняем код
	code := generate4DigitCode()
	expires := time.Now().Add(5 * time.Minute)
	if err := s.repo.UpsertPhoneVerificationToken(ctx, phone, code, expires); err != nil {
		return err
	}

	// 3) Отправляем SMS
	if err := s.sms.SendSMS(phone, "Код для сброса пароля: "+code); err != nil {
		return err
	}

	// 4) Отмечаем телефон как верифицированный для сброса (TTL 5 минут)
	s.markPhoneVerified(phone)
	return nil
}


