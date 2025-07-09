package repository

import (
	"sync"
	"context"
	"domofon/internal/model"
	"errors"
)

type UserRepository interface {
	GetUsers(ctx context.Context) ([]model.User, error)
	CreateUser(ctx context.Context, user model.User) error
	UpdateUser(ctx context.Context, user model.User) error
	DeleteUser(ctx context.Context, userID string) error
}

type userRepository struct {
	users map[string]model.User
	mu    sync.Mutex
}

func NewUserRepository() UserRepository {
	return &userRepository{
		users: make(map[string]model.User),
	}
}

func (r *userRepository) GetUsers(ctx context.Context) ([]model.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	users := make([]model.User, 0, len(r.users))
	for _, u := range r.users {
		users = append(users, u)
	}
	return users, nil
}

func (r *userRepository) CreateUser(ctx context.Context, u model.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[u.ID] = u
	return nil
}

func (r *userRepository) UpdateUser(ctx context.Context, u model.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.users[u.ID]; !ok {
		return errors.New("user not found")
	}
	r.users[u.ID] = u
	return nil
}

func (r *userRepository) DeleteUser(ctx context.Context, userID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.users, userID)
	return nil
}
