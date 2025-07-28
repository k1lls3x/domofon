package user

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
    "domofon/internal/db"
		"domofon/internal/middleware"
		"github.com/jackc/pgx/v5/pgtype"
    "strconv"
		"strings"
		"fmt"
		"io"
		"os"
		"path/filepath"

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
    service *UserService
}

func NewUserHandler(s *UserService) *UserHandler {
    return &UserHandler{service: s}
}

// GetUsers godoc
// @Summary      Получить список пользователей
// @Tags         users
// @Produce      json
// @Success      200  {array}   db.User
// @Failure      500  {string}  string "Internal error"
// @Security     BearerAuth
// @Router       /users [get]
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

// CreateUser godoc
// @Summary      Создать пользователя
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        user  body      CreateUserRequest  true  "Новый пользователь"
// @Success      201   {object}  db.User
// @Failure      400   {string}  string "Bad request"
// @Failure      500   {string}  string "Internal error"
// @Router       /users [post]
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
    Email:        req.Email,
    Phone:        req.Phone,
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


// UpdateUser godoc
// @Summary      Обновить пользователя
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id    path      int  true  "ID пользователя"
// @Param        user  body      db.UpdateUserParams  true  "Данные пользователя"
// @Success      200   {object}  db.User
// @Failure      400   {string}  string "Bad request"
// @Failure      500   {string}  string "Internal error"
// @Security     BearerAuth
// @Router       /users/{id} [put]
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


// DeleteUser godoc
// @Summary      Удалить пользователя
// @Tags         users
// @Param        id    path      int  true  "ID пользователя"
// @Success      204   {string}  string "No Content"
// @Failure      400   {string}  string "Bad request"
// @Failure      500   {string}  string "Internal error"
// @Security     BearerAuth
// @Router       /users/{id} [delete]
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

// GetCurrentUser godoc
// @Summary      Получить профиль текущего пользователя
// @Tags         users
// @Produce      json
// @Success      200  {object}  db.User
// @Failure      401  {string}  string "Unauthorized"
// @Failure      404  {string}  string "User not found"
// @Security     BearerAuth
// @Router       /users/me [get]
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
    userID, ok := middleware.UserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    user, err := h.service.repo.GetUserByID(r.Context(), int32(userID))
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// UploadAvatar godoc
// @Summary      Загрузить или обновить аватар пользователя
// @Tags         users
// @Accept       mpfd
// @Produce      json
// @Param        avatar  formData  file  true  "Файл аватара (jpg/png/webp)"
// @Success      200  {object}  map[string]string
// @Failure      400  {string}  string "Bad request"
// @Failure      401  {string}  string "Unauthorized"
// @Failure      500  {string}  string "Internal error"
// @Security     BearerAuth
// @Router       /users/me/avatar [post]
func (h *UserHandler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
    userID, ok := middleware.UserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    r.Body = http.MaxBytesReader(w, r.Body, 5<<20)
    file, header, err := r.FormFile("avatar")
    if err != nil {
        http.Error(w, "Failed to read file", http.StatusBadRequest)
        return
    }
    defer file.Close()

    ext := strings.ToLower(filepath.Ext(header.Filename))
    if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
        http.Error(w, "Invalid file type", http.StatusBadRequest)
        return
    }

    filename := fmt.Sprintf("avatar_%d%s", userID, ext)
    savePath := filepath.Join("uploads", filename)
    _ = os.MkdirAll("uploads", 0755)

    out, err := os.Create(savePath)
    if err != nil {
        http.Error(w, "Could not save file", http.StatusInternalServerError)
        return
    }
    defer out.Close()
    if _, err := io.Copy(out, file); err != nil {
        http.Error(w, "Failed to save file", http.StatusInternalServerError)
        return
    }

    avatarURL := "/" + savePath
    err = h.service.UpdateUserAvatarURL(r.Context(), int32(userID), avatarURL)
    if err != nil {
        http.Error(w, "Could not update avatar", http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusOK)
    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(fmt.Sprintf(`{"avatar_url":"%s"}`, avatarURL)))
}

// DeleteAvatar godoc
// @Summary      Удалить аватар пользователя
// @Tags         users
// @Success      204  {string}  string "No Content"
// @Failure      401  {string}  string "Unauthorized"
// @Failure      500  {string}  string "Internal error"
// @Security     BearerAuth
// @Router       /users/me/avatar [delete]
func (h *UserHandler) DeleteAvatar(w http.ResponseWriter, r *http.Request) {
    userID, ok := middleware.UserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    avatarURL, err := h.service.GetUserAvatarURL(r.Context(), int32(userID))
    if err == nil && avatarURL != "" {
        _ = os.Remove("." + avatarURL)
    }
    err = h.service.UpdateUserAvatarURL(r.Context(), int32(userID), "")
    if err != nil {
        http.Error(w, "Could not delete avatar", http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}
