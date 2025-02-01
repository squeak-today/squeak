package supabase

import (
	"database/sql"
	"fmt"
	"os"
	"time"
)

// supabase database client
type Client struct {
	db *sql.DB
}

// QueryParams: query parameters for story-query and news-query endpoints
type QueryParams struct {
	Language string
	CEFR     string
	Subject  string
	Page     int
	PageSize int
}

func NewClient() (*Client, error) {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		os.Getenv("SUPABASE_HOST"),
		os.Getenv("SUPABASE_PORT"),
		os.Getenv("SUPABASE_USER"),
		os.Getenv("SUPABASE_PASSWORD"),
		os.Getenv("SUPABASE_DATABASE"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	return &Client{db: db}, nil
}

func (c *Client) Close() error {
	return c.db.Close()
}

func (c *Client) QueryNews(params QueryParams) ([]map[string]interface{}, error) {
	query := "SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created FROM news WHERE 1=1"
	return c.queryContent(query, params)
}

func (c *Client) QueryStories(params QueryParams) ([]map[string]interface{}, error) {
	query := "SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created FROM stories WHERE 1=1"
	return c.queryContent(query, params)
}

// helper function called in the QueryNews and QueryStories functions
// builds on the SQL query string based on the query params
func (c *Client) queryContent(baseQuery string, params QueryParams) ([]map[string]interface{}, error) {
	var queryParams []interface{}
	paramCount := 1

	if params.Language != "" && params.Language != "any" {
		baseQuery += fmt.Sprintf(" AND language = $%d", paramCount)
		queryParams = append(queryParams, params.Language)
		paramCount++
	}

	if params.CEFR != "" && params.CEFR != "any" {
		baseQuery += fmt.Sprintf(" AND cefr_level = $%d", paramCount)
		queryParams = append(queryParams, params.CEFR)
		paramCount++
	}

	if params.Subject != "" && params.Subject != "any" {
		baseQuery += fmt.Sprintf(" AND topic = $%d", paramCount)
		queryParams = append(queryParams, params.Subject)
		paramCount++
	}

	baseQuery += " ORDER BY created_at DESC"
	baseQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramCount, paramCount+1)
	queryParams = append(queryParams, params.PageSize, (params.Page-1)*params.PageSize)

	rows, err := c.db.Query(baseQuery, queryParams...)
	if err != nil {
		return nil, fmt.Errorf("query execution failed: %v", err)
	}
	defer rows.Close()

	results := make([]map[string]interface{}, 0)

	for rows.Next() {
		var id, title, language, topic, cefrLevel, previewText string
		var createdAt time.Time
		var dateCreated sql.NullTime

		err := rows.Scan(&id, &title, &language, &topic, &cefrLevel, &previewText, &createdAt, &dateCreated)
		if err != nil {
			return nil, fmt.Errorf("data scanning failed: %v", err)
		}

		result := map[string]interface{}{
			"id":           id,
			"title":        title,
			"language":     language,
			"topic":        topic,
			"cefr_level":   cefrLevel,
			"preview_text": previewText,
			"created_at":   createdAt,
			"date_created": dateCreated.Time.Format("2006-01-02"),
		}
		results = append(results, result)
	}

	return results, nil
}
