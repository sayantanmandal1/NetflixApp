package db

import (
	"context"
	"log"
)

func Migrate() {
	queries := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS profiles (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			avatar_url VARCHAR(500) DEFAULT '',
			is_kids BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS favorites (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
			tmdb_id INTEGER NOT NULL,
			media_type VARCHAR(10) NOT NULL DEFAULT 'movie',
			added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			UNIQUE(profile_id, tmdb_id, media_type)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_favorites_profile_id ON favorites(profile_id)`,
	}

	for _, q := range queries {
		_, err := Pool.Exec(context.Background(), q)
		if err != nil {
			log.Printf("Migration warning: %v", err)
		}
	}
	log.Println("Database migrations completed")
}
