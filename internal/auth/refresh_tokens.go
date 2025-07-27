package auth
import(
	"context"
	"domofon/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
	"time"
)
func (r *AuthRepository) SaveRefreshToken(ctx context.Context, userID int64, token, jti string, expiresAt time.Time) error {
    return r.queries.SaveRefreshToken(ctx, db.SaveRefreshTokenParams{
        UserID:    int32(userID), // если поле userID в БД int32
        Token:     token,
        Jti:       pgtype.Text{String: jti, Valid: true},
        ExpiresAt: pgtype.Timestamp{Time: expiresAt, Valid: true},
    })
}

func (r *AuthRepository) GetRefreshToken(ctx context.Context, token string) (*db.RefreshToken, error) {
    rt, err := r.queries.GetRefreshToken(ctx, token)
    if err != nil {
        return nil, err
    }
    return &rt, nil
}

func (r *AuthRepository) DeleteRefreshToken(ctx context.Context, token string) error {
    return r.queries.DeleteRefreshToken(ctx, token)
}
