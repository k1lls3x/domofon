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
-- name: UpdateUser :one
UPDATE users
SET
    username = $2,
    password_hash = $3,
    email = $4,
    phone = $5,
    role = $6,
    is_active = $7
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: GetUserByUsername :one
SELECT id, username, password_hash, email, phone, role, is_active, created_at FROM users WHERE username = $1;

-- name: RegisterUser :exec
INSERT INTO users(username, password_hash, email, phone, role, is_active)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: ChangePassword :exec
UPDATE users SET password_hash = $1 WHERE username = $2;

