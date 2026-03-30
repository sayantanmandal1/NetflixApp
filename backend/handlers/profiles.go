package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netflix-clone/backend/db"
	"github.com/netflix-clone/backend/models"
)

type ProfileHandler struct{}

func NewProfileHandler() *ProfileHandler {
	return &ProfileHandler{}
}

func (h *ProfileHandler) List(c *gin.Context) {
	userID := c.GetString("user_id")

	rows, err := db.Pool.Query(context.Background(),
		"SELECT id, user_id, name, avatar_url, is_kids, created_at FROM profiles WHERE user_id=$1 ORDER BY created_at",
		userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profiles"})
		return
	}
	defer rows.Close()

	var profiles []models.Profile
	for rows.Next() {
		var p models.Profile
		if err := rows.Scan(&p.ID, &p.UserID, &p.Name, &p.AvatarURL, &p.IsKids, &p.CreatedAt); err != nil {
			continue
		}
		profiles = append(profiles, p)
	}

	if profiles == nil {
		profiles = []models.Profile{}
	}

	c.JSON(http.StatusOK, profiles)
}

func (h *ProfileHandler) Create(c *gin.Context) {
	userID := c.GetString("user_id")

	// Check profile count (max 5)
	var count int
	_ = db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM profiles WHERE user_id=$1", userID).Scan(&count)
	if count >= 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 5 profiles allowed"})
		return
	}

	var input models.ProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	if input.AvatarURL == "" {
		input.AvatarURL = "/avatars/avatar1.png"
	}

	var profile models.Profile
	err := db.Pool.QueryRow(context.Background(),
		`INSERT INTO profiles (user_id, name, avatar_url, is_kids) VALUES ($1, $2, $3, $4) 
		 RETURNING id, user_id, name, avatar_url, is_kids, created_at`,
		userID, input.Name, input.AvatarURL, input.IsKids).
		Scan(&profile.ID, &profile.UserID, &profile.Name, &profile.AvatarURL, &profile.IsKids, &profile.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
		return
	}

	c.JSON(http.StatusCreated, profile)
}

func (h *ProfileHandler) Update(c *gin.Context) {
	userID := c.GetString("user_id")
	profileID := c.Param("id")

	var input models.ProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	var profile models.Profile
	err := db.Pool.QueryRow(context.Background(),
		`UPDATE profiles SET name=$1, avatar_url=$2, is_kids=$3 
		 WHERE id=$4 AND user_id=$5 
		 RETURNING id, user_id, name, avatar_url, is_kids, created_at`,
		input.Name, input.AvatarURL, input.IsKids, profileID, userID).
		Scan(&profile.ID, &profile.UserID, &profile.Name, &profile.AvatarURL, &profile.IsKids, &profile.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *ProfileHandler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	profileID := c.Param("id")

	result, err := db.Pool.Exec(context.Background(),
		"DELETE FROM profiles WHERE id=$1 AND user_id=$2", profileID, userID)
	if err != nil || result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile deleted"})
}
