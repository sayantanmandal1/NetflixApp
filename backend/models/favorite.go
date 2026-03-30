package models

import "time"

type Favorite struct {
	ID        string    `json:"id"`
	ProfileID string    `json:"profile_id"`
	TmdbID    int       `json:"tmdb_id"`
	MediaType string    `json:"media_type"`
	AddedAt   time.Time `json:"added_at"`
}

type FavoriteInput struct {
	TmdbID    int    `json:"tmdb_id" binding:"required"`
	MediaType string `json:"media_type" binding:"required,oneof=movie tv"`
}
