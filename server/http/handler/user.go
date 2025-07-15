package handler

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
    "domofon/internal/db"
    "domofon/internal/service"
		  "github.com/jackc/pgx/v5/pgtype"
    "strconv"
)

func toPgText(s string) pgtype.Text {
	if s == "" {
			return pgtype.Text{Valid: false}
	}
	return pgtype.Text{
			String: s,
			Valid:  true,
	}
}

type CreateUserRequest struct {
	Username     string `json:"username"`
	PasswordHash string `json:"password_hash"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Role         string `json:"role"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
}

type UserHandler struct {
    service *service.UserService
}

func NewUserHandler(s *service.UserService) *UserHandler {
    return &UserHandler{service: s}
}

// Получить список всех пользователей
func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    users, err := h.service.GetUsers(ctx)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

// Создать пользователя
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
	}

	params := db.CreateUserParams{
    Username:     req.Username,
    PasswordHash: req.PasswordHash,
    Email:        toPgText(req.Email),
    Phone:        toPgText(req.Phone),
    Role:         toPgText(req.Role),
    FirstName:    toPgText(req.FirstName),
    LastName:     toPgText(req.LastName),
	}


	user, err := h.service.CreateUser(ctx, params)
	if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}


// Обновить пользователя
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    vars := mux.Vars(r)
    idStr := vars["id"]
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }
    var params db.UpdateUserParams
    if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    params.ID = int32(id) // обязательно подставить id!
    user, err := h.service.UpdateUser(ctx, params)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(user)
}

// Удалить пользователя
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    vars := mux.Vars(r)
    idStr := vars["id"]
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }
    if err := h.service.DeleteUser(ctx, int32(id)); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}
