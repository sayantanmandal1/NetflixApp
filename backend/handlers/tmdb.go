package handlers

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/netflix-clone/backend/config"
)

type TMDBHandler struct {
	Cfg    *config.Config
	Client *http.Client
}

func NewTMDBHandler(cfg *config.Config) *TMDBHandler {
	return &TMDBHandler{
		Cfg: cfg,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (h *TMDBHandler) Proxy(c *gin.Context) {
	path := c.Param("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Path required"})
		return
	}

	tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3%s", path)

	req, err := http.NewRequestWithContext(c.Request.Context(), "GET", tmdbURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	// Copy query parameters and add API key
	q := c.Request.URL.Query()
	q.Set("api_key", h.Cfg.TMDBAPIKey)
	if q.Get("language") == "" {
		q.Set("language", "en-US")
	}
	req.URL.RawQuery = q.Encode()

	req.Header.Set("Accept", "application/json")

	resp, err := h.Client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach TMDB"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	c.Data(resp.StatusCode, "application/json", body)
}
