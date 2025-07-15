-- Получить всех пользователей
-- name: GetUsers :many
SELECT * FROM users;
-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: CreateUser :one
INSERT INTO users (username, password_hash, email, phone, role, first_name, last_name)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET username = $2,
    password_hash = $3,
    email = $4,
    phone = $5,
    role = $6,
    first_name = $7,
    last_name = $8
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

-- name: RegisterUser :exec
INSERT INTO users(username, password_hash, email, phone, role, is_active, first_name, last_name)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- name: ChangePassword :exec
UPDATE users SET password_hash = $1 WHERE username = $2;

-- name: CreatePasswordResetToken :exec
INSERT INTO password_reset_tokens (user_id, token, expires_at)
VALUES ($1, $2, $3);

-- name: GetUserByResetToken :one
SELECT u.*
FROM users u
JOIN password_reset_tokens prt ON prt.user_id = u.id
WHERE prt.token = $1 AND prt.expires_at > NOW();

-- name: InvalidateResetToken :exec
DELETE FROM password_reset_tokens WHERE token = $1;

-- name: DeleteAllResetTokensForUser :exec
DELETE FROM password_reset_tokens WHERE user_id = $1;

-- name: GetUserByPhone :one
SELECT * FROM users WHERE phone = $1;
