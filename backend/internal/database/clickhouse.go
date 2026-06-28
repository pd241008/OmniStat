package database

import (
	"context"
	"log"
	"os"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

var db driver.Conn

// SetDB sets the ClickHouse connection (used for testing)
func SetDB(conn driver.Conn) {
	db = conn
}

// InitDB initializes the ClickHouse connection using environment variables
func InitDB() {
	var err error

	chHost := os.Getenv("CLICKHOUSE_HOST")
	if chHost == "" {
		chHost = "localhost:9000"
	}
	chUser := os.Getenv("CLICKHOUSE_USER")
	if chUser == "" {
		chUser = "default"
	}
	chPassword := os.Getenv("CLICKHOUSE_PASSWORD")

	db, err = clickhouse.Open(&clickhouse.Options{
		Addr: []string{chHost},
		Auth: clickhouse.Auth{
			Database: "default",
			Username: chUser,
			Password: chPassword,
		},
		ClientInfo: clickhouse.ClientInfo{
			Products: []struct {
				Name    string
				Version string
			}{
				{Name: "OmniStat Gateway", Version: "1.0"},
			},
		},
	})

	if err != nil {
		log.Printf("[WARNING] ClickHouse connection failed: %v", err)
	} else if err := db.Ping(context.Background()); err != nil {
		log.Printf("[WARNING] ClickHouse ping failed: %v", err)
	} else {
		log.Println("[SYSTEM] Connected to ClickHouse successfully")
	}
}

// GetDB returns the initialized ClickHouse connection
func GetDB() driver.Conn {
	return db
}
