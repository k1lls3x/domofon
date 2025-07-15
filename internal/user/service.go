package user

import (
    "context"
    "domofon/internal/db"

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
