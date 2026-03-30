package models

import "time"

type Profile struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	AvatarURL string    `json:"avatar_url"`
	IsKids    bool      `json:"is_kids"`
	CreatedAt time.Time `json:"created_at"`
}

type ProfileInput struct {
	Name      string `json:"name" binding:"required,min=1,max=100"`
	AvatarURL string `json:"avatar_url"`
	IsKids    bool   `json:"is_kids"`
}
