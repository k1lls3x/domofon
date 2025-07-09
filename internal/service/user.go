package service

import (
    "context"
    "domofon/internal/model"
    "domofon/internal/repository"
)

type UserService struct {
    repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
    return &UserService{repo: repo}
}
func (s *UserService) GetUsers(ctx context.Context) ([]model.User, error) {
	return s.repo.GetUsers(ctx)
}

func (s *UserService) CreateUser(ctx context.Context, user model.User) error {
	return s.repo.CreateUser(ctx, user)
}

func (s *UserService) UpdateUser(ctx context.Context, user model.User) error {
	return s.repo.UpdateUser(ctx, user)
}

func (s *UserService) DeleteUser(ctx context.Context, userID string) error {
	return s.repo.DeleteUser(ctx, userID)
}

