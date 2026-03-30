package config

import "os"

type Config struct {
	DatabaseURL string
	JWTSecret   string
	TMDBAPIKey  string
	Port        string
}

func Load() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgresql://netflix:netflix_secret_pw_2026@localhost:5432/netflix_clone?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", ""),
		TMDBAPIKey:  getEnv("TMDB_API_KEY", ""),
		Port:        getEnv("PORT", "8000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
