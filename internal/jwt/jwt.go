package jwt

import (
	"os"
	"time"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"errors"
)

var (
  jwtToken = []byte(os.Getenv("JWT_TOKEN"))
	refreshToken = []byte(os.Getenv("REFRESH_JWT_TOKEN"))
	issuer        = "domofon"
)

func GenerateAccessToken(userID int64) (string, string, error) {
	jti := uuid.NewString()
	claims := AccessClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Subject:   string(rune(userID)),
			Audience:  []string{"domofon"},
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			ID:        jti,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(jwtToken)
	return signed, jti, err
}

func GenerateRefreshToken(userID int64, jti string) (string, error) {
	claims := RefreshClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Subject:   string(rune(userID)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			ID:        jti,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(refreshToken)
}

func ParseAccessToken(tokenStr string) (*AccessClaims, error) {
	claims := &AccessClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtToken, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}

func ParseRefreshToken(tokenStr string) (*RefreshClaims, error) {
	claims := &RefreshClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return refreshToken, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}

