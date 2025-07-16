package auth

import (
	"context"
	"domofon/internal/db"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Auth interface {
	RegisterUser(ctx context.Context, params db.RegisterUserParams) error
	GetUserByUsername(ctx context.Context, username string) (*db.User, error)

	CreatePasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error
	GetUserByResetToken(ctx context.Context, token string) (*db.User, error)
	InvalidateResetToken(ctx context.Context, token string) error
	GetUserByPhone(ctx context.Context, phone string) (*db.User, error)
	ChangePasswordByPhone(ctx context.Context, phone string, newHash string) error
}

type AuthRepository struct {
	queries *db.Queries
}

func NewAuthRepository(pool *pgxpool.Pool) *AuthRepository {
	return &AuthRepository{queries: db.New(pool)}
}

func (r *AuthRepository) RegisterUser(ctx context.Context, params db.RegisterUserParams) error {
	return r.queries.RegisterUser(ctx, params)
}

func (r *AuthRepository) GetUserByUsername(ctx context.Context, username string) (*db.User, error) {
	user, err := r.queries.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) ChangePasswordByPhone(ctx context.Context, phone, newHash string) error {
	return r.queries.ChangePasswordByPhone(ctx, db.ChangePasswordByPhoneParams{
		PasswordHash: newHash,
		Phone:        pgtype.Text{String: phone, Valid: true},
	})
}
func (r *AuthRepository) CreatePasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error {
	return r.queries.CreatePasswordResetToken(ctx, db.CreatePasswordResetTokenParams{
		UserID:    pgtype.Int4{Int32: int32(userID), Valid: true},
		Token:     token,
		ExpiresAt: pgtype.Timestamp{Time: expiresAt, Valid: true},
	})
}

func (r *AuthRepository) GetUserByResetToken(ctx context.Context, token string) (*db.User, error) {
	user, err := r.queries.GetUserByResetToken(ctx, token)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) InvalidateResetToken(ctx context.Context, token string) error {
	return r.queries.InvalidateResetToken(ctx, token)
}

func (r *AuthRepository) GetUserByPhone(ctx context.Context, phone string) (*db.User, error) {
	user, err := r.queries.GetUserByPhone(ctx, pgtype.Text{String: phone, Valid: phone != ""})
	if err != nil {
		return nil, err
	}
	return &user, nil
}
