package verification

import (
	"context"
	"domofon/internal/db"
	"time"
_"errors"

  _ "github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	_"github.com/jackc/pgx/v5/pgxpool"
)
type Repository interface {
	// Сохраняет или обновляет код подтверждения для телефона
	UpsertToken(ctx context.Context, phone, code string, expiresAt time.Time) error
	// Получает запись по телефону и коду
	GetToken(ctx context.Context, phone, code string) (*db.PhoneVerificationToken, error)
	// Получает последнюю запись по телефону (например, для ограничения частоты отправки)
	GetTokenByPhone(ctx context.Context, phone string) (*db.PhoneVerificationToken, error)
	// Удаляет запись после успешной верификации
	DeleteToken(ctx context.Context, phone string) error
}


type VerificationRepository struct {
	queries *db.Queries
}

func NewRepository(queries *db.Queries) *VerificationRepository {
	return &VerificationRepository{queries: queries}
}

func (r *VerificationRepository) UpsertToken(ctx context.Context, phone, code string, expiresAt time.Time) error {
	return r.queries.UpsertPhoneVerificationToken(ctx, db.UpsertPhoneVerificationTokenParams{
		Phone:            phone,
		VerificationCode: code,
		ExpiresAt:         pgtype.Timestamp{Time: expiresAt, Valid: true},
	})
}

func (r *VerificationRepository) GetToken(ctx context.Context, phone, code string) (*db.PhoneVerificationToken, error) {
	token, err := r.queries.GetPhoneVerificationToken(ctx, db.GetPhoneVerificationTokenParams{
		Phone:            phone,
		VerificationCode: code,
	})
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *VerificationRepository) GetTokenByPhone(ctx context.Context, phone string) (*db.PhoneVerificationToken, error) {
	token, err := r.queries.GetPhoneVerificationTokenByPhone(ctx, phone)
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *VerificationRepository) DeleteToken(ctx context.Context, phone string) error {
	return r.queries.DeletePhoneVerificationToken(ctx, phone)
}

func (r *VerificationRepository) UpsertPhoneVerificationToken(ctx context.Context, phone, code string, expiresAt time.Time) error {
	return r.queries.UpsertPhoneVerificationToken(ctx, db.UpsertPhoneVerificationTokenParams{
		Phone:            phone,
		VerificationCode: code,
		ExpiresAt:        pgtype.Timestamp{Time: expiresAt, Valid: true},
	})
}

func (r *VerificationRepository) GetPhoneVerificationToken(ctx context.Context, phone, code string) (*db.PhoneVerificationToken, error) {
    token, err := r.queries.GetPhoneVerificationToken(ctx, db.GetPhoneVerificationTokenParams{
        Phone:            phone,
        VerificationCode: code,
    })
    if err != nil {
        return nil, err
    }
    return &token, nil
}

func (r *VerificationRepository) DeletePhoneVerificationToken(ctx context.Context, phone string) error {
	return r.queries.DeletePhoneVerificationToken(ctx, phone)
}
