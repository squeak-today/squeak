package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/stdlib"
)

type Client struct {
	db *sql.DB
}

func NewClient() (*Client, error) {
	config, err := pgx.ParseConfig(fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=require",
		os.Getenv("SUPABASE_USER"),
		os.Getenv("SUPABASE_PASSWORD"),
		os.Getenv("SUPABASE_HOST"),
		os.Getenv("SUPABASE_PORT"),
		os.Getenv("SUPABASE_DATABASE"),
	))
	if err != nil {
		return nil, fmt.Errorf("failed to parse config: %v", err)
	}

	config.PreferSimpleProtocol = true
	db := stdlib.OpenDB(*config)

	return &Client{db: db}, nil
}

func (c *Client) Close() error {
	return c.db.Close()
}

func (c *Client) InsertNewsSource(source *NewsSource) error {
	_, err := c.db.Exec("INSERT INTO news_sources (topic, title, url, content, score) VALUES ($1, $2, $3, $4, $5)",
		source.Topic, source.Title, source.URL, source.Content, source.Score)
	if err != nil {
		return fmt.Errorf("failed to insert news source: %v", err)
	}
	return nil
}
