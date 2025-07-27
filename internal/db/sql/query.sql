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

-- name: ChangePasswordByPhone :exec
UPDATE users
SET password_hash = $1
WHERE phone = $2;

-- name: UpsertPhoneVerificationToken :exec
INSERT INTO phone_verification_tokens (phone, verification_code, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (phone)
DO UPDATE SET verification_code = EXCLUDED.verification_code, expires_at = EXCLUDED.expires_at, created_at = CURRENT_TIMESTAMP;

-- name: GetPhoneVerificationToken :one
SELECT * FROM phone_verification_tokens
WHERE phone = $1 AND verification_code = $2 AND expires_at > NOW();

-- name: DeletePhoneVerificationToken :exec
DELETE FROM phone_verification_tokens WHERE phone = $1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetPhoneVerificationTokenByPhone :one
SELECT phone, verification_code, expires_at, created_at
FROM phone_verification_tokens
WHERE phone = $1;

-- name: SaveRefreshToken :exec
INSERT INTO refresh_tokens (user_id, token, jti, expires_at)
VALUES ($1, $2, $3, $4);

-- name: GetRefreshToken :one
SELECT id, user_id, token, jti, expires_at
FROM refresh_tokens
WHERE token = $1;

-- name: DeleteRefreshToken :exec
DELETE FROM refresh_tokens
WHERE token = $1;
