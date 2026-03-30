package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/netflix-clone/backend/config"
	"github.com/netflix-clone/backend/db"
	"github.com/netflix-clone/backend/handlers"
	"github.com/netflix-clone/backend/middleware"
)

func main() {
	cfg := config.Load()

	db.Connect(cfg)
	defer db.Close()
	db.Migrate()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// Health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes
	authHandler := handlers.NewAuthHandler(cfg)
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.GET("/me", middleware.AuthRequired(cfg), authHandler.Me)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthRequired(cfg))
	{
		// Profiles
		profileHandler := handlers.NewProfileHandler()
		protected.GET("/profiles", profileHandler.List)
		protected.POST("/profiles", profileHandler.Create)
		protected.PUT("/profiles/:id", profileHandler.Update)
		protected.DELETE("/profiles/:id", profileHandler.Delete)

		// Favorites
		favHandler := handlers.NewFavoriteHandler()
		protected.GET("/profiles/:id/favorites", favHandler.List)
		protected.POST("/profiles/:id/favorites", favHandler.Add)
		protected.DELETE("/profiles/:id/favorites/:tmdbId", favHandler.Remove)
		protected.GET("/profiles/:id/favorites/:tmdbId/check", favHandler.Check)
	}

	// TMDB Proxy (public — no auth required, key hidden server-side)
	tmdbHandler := handlers.NewTMDBHandler(cfg)
	r.GET("/api/tmdb/*path", tmdbHandler.Proxy)

	log.Printf("Backend starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
