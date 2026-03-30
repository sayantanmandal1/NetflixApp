package db

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/netflix-clone/backend/config"
)

var Pool *pgxpool.Pool

func Connect(cfg *config.Config) {
	var err error
	for i := 0; i < 10; i++ {
		Pool, err = pgxpool.New(context.Background(), cfg.DatabaseURL)
		if err == nil {
			if err = Pool.Ping(context.Background()); err == nil {
				log.Println("Connected to PostgreSQL")
				return
			}
		}
		log.Printf("Waiting for database... attempt %d/10", i+1)
		time.Sleep(2 * time.Second)
	}
	log.Fatalf("Cannot connect to database: %v", err)
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
