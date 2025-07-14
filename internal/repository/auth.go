package repository

import (
	"context"
	"domofon/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"

)

type Auth interface {
	RegisterUser(ctx context.Context, params db.RegisterUserParams) error
	GetUserByUsername(ctx context.Context, username string) (*db.User, error)
	ChangePassword(ctx context.Context, username, newPasswordHash string) error
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

func (r *AuthRepository) ChangePassword(ctx context.Context, username string, newPasswordHash string) error {
	return r.queries.ChangePassword(ctx, db.ChangePasswordParams{
		Username:     username,
		PasswordHash: newPasswordHash,
	})
}
