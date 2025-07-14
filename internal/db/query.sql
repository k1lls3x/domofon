-- Получить всех пользователей
-- name: GetUsers :many
SELECT * FROM users;
-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: CreateUser :one
INSERT INTO users (username, password_hash, email, phone, role, is_active)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateUser :one
UPDATE users SET ... WHERE id = $1 RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
