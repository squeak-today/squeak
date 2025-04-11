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

type Result struct {
	Title   string  `json:"title"`
	URL     string  `json:"url"`
	Content string  `json:"content"`
	Score   float64 `json:"score"`
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

func (c *Client) GetCurrentNewsSources(topic string) ([]Result, error) {
	rows, err := c.db.Query(`
		SELECT title, url, content, score 
		FROM news_sources 
		WHERE topic = $1
		AND created_at >= NOW() - INTERVAL '23 hours'
		ORDER BY created_at DESC
		LIMIT 100`, topic)
	if err != nil {
		return nil, fmt.Errorf("failed to get news sources: %v", err)
	}
	defer rows.Close()

	sources := []Result{}
	for rows.Next() {
		var source Result
		if err := rows.Scan(&source.Title, &source.URL, &source.Content, &source.Score); err != nil {
			return nil, fmt.Errorf("failed to scan news source: %v", err)
		}
		sources = append(sources, source)
	}

	return sources, nil
}

func (c *Client) InsertNews(title, language, topic, cefrLevel, preview_text string) (int, error) {
	query := `
        INSERT INTO news (title, language, topic, cefr_level, preview_text, created_at, date_created)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT ON CONSTRAINT unique_news_entry
        DO UPDATE SET
            title = EXCLUDED.title,
            preview_text = EXCLUDED.preview_text,
            created_at = NOW()
        RETURNING id
    `

	var id int
	err := c.db.QueryRow(query, title, language, topic, cefrLevel, preview_text).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("failed to insert news: %v", err)
	}

	return id, nil
}

func (c *Client) InsertAudiobook(news_id int, tier string) error {
	query := `
		INSERT INTO audiobooks (news_id, tier)
		VALUES ($1, $2)
		ON CONFLICT ON CONSTRAINT unique_audiobook_entry
		DO UPDATE SET
			tier = EXCLUDED.tier
	`
	_, err := c.db.Exec(query, news_id, tier)
	if err != nil {
		return fmt.Errorf("failed to insert audiobook: %v", err)
	}

	return nil
}
