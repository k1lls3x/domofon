package model


// User represents a user in the system.
// It contains fields for the user's ID, name, and role.
type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}
