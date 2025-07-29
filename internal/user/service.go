package user

import (
    "context"
    "domofon/internal/db"
		"fmt"
)

type UserService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

// Получить всех пользователей
func (s *UserService) GetUsers(ctx context.Context) ([]db.User, error) {
    return s.repo.GetUsers(ctx)
}

// Создать пользователя
func (s *UserService) CreateUser(ctx context.Context, params db.CreateUserParams) (db.User, error) {
    return s.repo.CreateUser(ctx, params)
}

// Обновить пользователя
func (s *UserService) UpdateUser(ctx context.Context, params db.UpdateUserParams) (db.User, error) {
    return s.repo.UpdateUser(ctx, params)
}

// Удалить пользователя
func (s *UserService) DeleteUser(ctx context.Context, userID int32) error {
    return s.repo.DeleteUser(ctx, userID)
}

func (s *UserService) GetUserAvatarURL(ctx context.Context, userID int32) (string, error) {
	return s.repo.GetUserAvatarURL(ctx, userID)
}

func (s *UserService) UpdateUserAvatarURL(ctx context.Context, userID int32, avatarURL string) error {
	return s.repo.UpdateUserAvatarURL(ctx, userID, avatarURL)
}

func (s *UserService) ChangeUsername(ctx context.Context, userID int32, username string) error {
	// Проверка на уникальность
	taken, err := s.repo.IsUsernameTaken(ctx, username)
	if err != nil {
		return err
	}
	if taken {
		return fmt.Errorf("username is already taken")
	}
	return s.repo.ChangeUsername(ctx, userID, username)
}

func (s *UserService) UpdateFullName(ctx context.Context, userID int32, firstName, lastName string) error {
	return s.repo.UpdateFullName(ctx, userID, firstName, lastName)
}

func (s *UserService) UpdateEmail(ctx context.Context, userID int, email string) error {
	isTaken, err := s.repo.IsEmailTaken(ctx, email)
	if err != nil {
		return fmt.Errorf("failed to check email uniqueness: %w", err)
	}
	if isTaken {
		return fmt.Errorf("email is already taken")
	}
	return s.repo.UpdateEmail(userID, email)
}
