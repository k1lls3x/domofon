package jwt

import "github.com/golang-jwt/jwt/v4"

// Claims для access-токена
type AccessClaims struct {
	UserID int64 `json:"sub"`
	jwt.RegisteredClaims
}

// Claims для refresh-токена
type RefreshClaims struct {
	UserID int64 `json:"sub"`
	jwt.RegisteredClaims
}
