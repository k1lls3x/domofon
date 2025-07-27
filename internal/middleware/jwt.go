package middleware

import (
    "net/http"
    "strings"
    "context"
    "domofon/internal/jwt"
)

type contextKey string

const userIDKey contextKey = "userID"

func JWTAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }

        tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
        claims, err := jwt.ParseAccessToken(tokenStr)
        if err != nil {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }

        // Кладём userID в context для handler-ов
        ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// В handler-ах можно достать userID так:
func UserIDFromContext(ctx context.Context) (int64, bool) {
    uid, ok := ctx.Value(userIDKey).(int64)
    return uid, ok
}
