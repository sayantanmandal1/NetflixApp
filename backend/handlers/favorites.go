package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netflix-clone/backend/db"
	"github.com/netflix-clone/backend/models"
)

type FavoriteHandler struct{}

func NewFavoriteHandler() *FavoriteHandler {
	return &FavoriteHandler{}
}

func (h *FavoriteHandler) List(c *gin.Context) {
	profileID := c.Param("id")
	userID := c.GetString("user_id")

	// Verify profile belongs to user
	var ownerID string
	err := db.Pool.QueryRow(context.Background(),
		"SELECT user_id FROM profiles WHERE id=$1", profileID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	rows, err := db.Pool.Query(context.Background(),
		"SELECT id, profile_id, tmdb_id, media_type, added_at FROM favorites WHERE profile_id=$1 ORDER BY added_at DESC",
		profileID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorites"})
		return
	}
	defer rows.Close()

	var favs []models.Favorite
	for rows.Next() {
		var f models.Favorite
		if err := rows.Scan(&f.ID, &f.ProfileID, &f.TmdbID, &f.MediaType, &f.AddedAt); err != nil {
			continue
		}
		favs = append(favs, f)
	}

	if favs == nil {
		favs = []models.Favorite{}
	}

	c.JSON(http.StatusOK, favs)
}

func (h *FavoriteHandler) Add(c *gin.Context) {
	profileID := c.Param("id")
	userID := c.GetString("user_id")

	// Verify profile belongs to user
	var ownerID string
	err := db.Pool.QueryRow(context.Background(),
		"SELECT user_id FROM profiles WHERE id=$1", profileID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var input models.FavoriteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	var fav models.Favorite
	err = db.Pool.QueryRow(context.Background(),
		`INSERT INTO favorites (profile_id, tmdb_id, media_type) VALUES ($1, $2, $3) 
		 ON CONFLICT (profile_id, tmdb_id, media_type) DO UPDATE SET added_at=NOW()
		 RETURNING id, profile_id, tmdb_id, media_type, added_at`,
		profileID, input.TmdbID, input.MediaType).
		Scan(&fav.ID, &fav.ProfileID, &fav.TmdbID, &fav.MediaType, &fav.AddedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add favorite"})
		return
	}

	c.JSON(http.StatusCreated, fav)
}

func (h *FavoriteHandler) Remove(c *gin.Context) {
	profileID := c.Param("id")
	tmdbID := c.Param("tmdbId")
	mediaType := c.DefaultQuery("media_type", "movie")
	userID := c.GetString("user_id")

	// Verify profile belongs to user
	var ownerID string
	err := db.Pool.QueryRow(context.Background(),
		"SELECT user_id FROM profiles WHERE id=$1", profileID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	result, err := db.Pool.Exec(context.Background(),
		"DELETE FROM favorites WHERE profile_id=$1 AND tmdb_id=$2 AND media_type=$3",
		profileID, tmdbID, mediaType)
	if err != nil || result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Favorite not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from favorites"})
}

func (h *FavoriteHandler) Check(c *gin.Context) {
	profileID := c.Param("id")
	tmdbID := c.Param("tmdbId")
	mediaType := c.DefaultQuery("media_type", "movie")

	var exists bool
	err := db.Pool.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM favorites WHERE profile_id=$1 AND tmdb_id=$2 AND media_type=$3)",
		profileID, tmdbID, mediaType).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_favorite": exists})
}
