package user

import (
	"context"
	"domofon/internal/db" // sqlc

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	GetUsers(ctx context.Context) ([]db.User, error)
	GetUserByID(ctx context.Context, id int32) (db.User, error)
	CreateUser(ctx context.Context, params db.CreateUserParams) (db.User, error)
	UpdateUser(ctx context.Context, params db.UpdateUserParams) (db.User, error)
	DeleteUser(ctx context.Context, id int32) error
	UpdateUserAvatarURL(ctx context.Context, userID int32, avatarURL string) error
	GetUserAvatarURL(ctx context.Context, userID int32) (string, error)
	UpdateAvatarURL(ctx context.Context, userID int64, avatarURL string) error
	ChangeUsername(ctx context.Context, userID int32, username string) error
	IsUsernameTaken(ctx context.Context, username string) (bool, error)
	UpdateFullName(ctx context.Context, userID int32, firstName, lastName string) error
	UpdateEmail(userID int, email string) error
	 IsEmailTaken(ctx context.Context, email string) (bool, error)
}

type userRepository struct {
	queries *db.Queries
}

func NewUserRepository(pool *pgxpool.Pool) UserRepository {
	return &userRepository{
		queries: db.New(pool),
	}
}

func (r *userRepository) GetUsers(ctx context.Context) ([]db.User, error) {
	return r.queries.GetUsers(ctx)
}

func (r *userRepository) GetUserByID(ctx context.Context, id int32) (db.User, error) {
	return r.queries.GetUserByID(ctx, id)
}

func (r *userRepository) CreateUser(ctx context.Context, params db.CreateUserParams) (db.User, error) {
	return r.queries.CreateUser(ctx, params)
}

func (r *userRepository) UpdateUser(ctx context.Context, params db.UpdateUserParams) (db.User, error) {
	return r.queries.UpdateUser(ctx, params)
}

func (r *userRepository) DeleteUser(ctx context.Context, id int32) error {
	return r.queries.DeleteUser(ctx, id)
}


func (r *userRepository) UpdateAvatarURL(ctx context.Context, userID int64, avatarURL string) error {
    return r.queries.UpdateUserAvatarURL(ctx, db.UpdateUserAvatarURLParams{
        ID:        int32(userID),
     AvatarUrl: pgtype.Text{
								String: avatarURL,
								Valid:  avatarURL != "",
		},
  })
}

func (r *userRepository) GetUserAvatarURL(ctx context.Context, userID int32) (string, error) {
	val, err := r.queries.GetUserAvatarURL(ctx, userID)
	if err != nil {
		return "", err
	}
	if !val.Valid {
		return "", nil
	}
	return val.String, nil
}


func (r *userRepository) UpdateUserAvatarURL(ctx context.Context, userID int32, avatarURL string) error {
	return r.queries.UpdateUserAvatarURL(ctx, db.UpdateUserAvatarURLParams{
		ID: userID,
		AvatarUrl: pgtype.Text{
			String: avatarURL,
			Valid:  avatarURL != "",
		},
	})
}

func (r *userRepository) ChangeUsername(ctx context.Context, userID int32, username string) error {
    return r.queries.ChangeUsername(ctx, db.ChangeUsernameParams{
        ID: userID,
        Username: username,
    })
}


func (r *userRepository) IsUsernameTaken(ctx context.Context, username string) (bool, error) {
	user, err := r.queries.GetUserByUsername(ctx, username)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return false, nil
		}
		return false, err
	}
	return user.ID != 0, nil
}

func (r *userRepository) IsEmailTaken(ctx context.Context, email string) (bool, error) {
	user, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return false, nil
		}
		return false, err
	}
	return user.ID != 0, nil
}


func (r *userRepository) UpdateFullName(ctx context.Context, userID int32, firstName, lastName string) error {
	return r.queries.UpdateUserFullName(ctx, db.UpdateUserFullNameParams{
		ID:        userID,
		FirstName: pgtype.Text{String: firstName, Valid: firstName != ""},
		LastName:  pgtype.Text{String: lastName, Valid: lastName != ""},
	})
}

func (r *userRepository) UpdateEmail(userID int, email string) error {
	ctx := context.Background()
	return r.queries.UpdateEmail(ctx,  db.UpdateEmailParams{
	ID : int32(userID),
	Email: email,
	})
}
