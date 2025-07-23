package verification

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"time"
	"domofon/internal/db"
)

type Service interface {
	UpsertToken(ctx context.Context, phone, code string, expiresAt time.Time) error
	GetToken(ctx context.Context, phone, code string) (*db.PhoneVerificationToken, error)
	GetTokenByPhone(ctx context.Context, phone string) (*db.PhoneVerificationToken, error)
	DeleteToken(ctx context.Context, phone string) error
	SendVerificationCode(ctx context.Context, phone string) error
	ResendVerificationCode(ctx context.Context, phone string) error
	VerifyCode(ctx context.Context, phone, code string) error

}

type serviceImpl struct {
	repo           Repository
	sms            SMSSender
	codeTTL        time.Duration
	resendInterval time.Duration
}

func NewService(repo Repository, sms SMSSender, codeTTL, resendInterval time.Duration) *serviceImpl {
	return &serviceImpl{
		repo:           repo,
		sms:            sms,
		codeTTL:        codeTTL,
		resendInterval: resendInterval,
	}
}

// 4-значный код
func generate4DigitCode() string {
	b := make([]byte, 2)
	_, _ = rand.Read(b)
	n := (uint(b[0])<<8 | uint(b[1])) % 10000
	return fmt.Sprintf("%04d", n)
}

func (s *serviceImpl) SendVerificationCode(ctx context.Context, phone string) error {
	token, err := s.repo.GetTokenByPhone(ctx, phone)
	if err == nil && token != nil && time.Since(token.CreatedAt.Time) < s.resendInterval {
		return errors.New("код уже отправлен, попробуйте позже")
	}

	code := generate4DigitCode()
	expiresAt := time.Now().Add(s.codeTTL)
	if err := s.repo.UpsertToken(ctx, phone, code, expiresAt); err != nil {
		return err
	}
	return s.sms.SendSMS(phone, "Код подтверждения: "+code)
}

func (s *serviceImpl) ResendVerificationCode(ctx context.Context, phone string) error {
	return s.SendVerificationCode(ctx, phone)
}

func (s *serviceImpl) VerifyCode(ctx context.Context, phone, code string) error {
	token, err := s.repo.GetToken(ctx, phone, code)
	if err != nil {
		return errors.New("неверный или просроченный код")
	}
	if token.ExpiresAt.Time.Before(time.Now()) {
		return errors.New("срок действия кода истёк")
	}
	_ = s.repo.DeleteToken(ctx, phone)
	return nil
}

func (s *serviceImpl) UpsertToken(ctx context.Context, phone, code string, expiresAt time.Time) error {
	return s.repo.UpsertToken(ctx, phone, code, expiresAt)
}
func (s *serviceImpl) GetToken(ctx context.Context, phone, code string) (*db.PhoneVerificationToken, error) {
	return s.repo.GetToken(ctx, phone, code)
}
func (s *serviceImpl) GetTokenByPhone(ctx context.Context, phone string) (*db.PhoneVerificationToken, error) {
	return s.repo.GetTokenByPhone(ctx, phone)
}
func (s *serviceImpl) DeleteToken(ctx context.Context, phone string) error {
	return s.repo.DeleteToken(ctx, phone)
}
