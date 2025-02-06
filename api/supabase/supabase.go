package supabase

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/lib/pq"
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

// Add these near the top with other type definitions
type Profile struct {
	Username           string   `json:"username"`
	LearningLanguage   string   `json:"learning_language"`
	SkillLevel         string   `json:"skill_level"`
	InterestedTopics   []string `json:"interested_topics"`
	DailyQuestionsGoal int      `json:"daily_questions_goal"`
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

// retrieves a question for the given content type, id, question type and CEFR level
func (c *Client) GetContentQuestion(contentType string, contentID string, questionType string, cefrLevel string) (map[string]interface{}, error) {
	var query string
	if contentType == "Story" {
		query = `
			SELECT id, story_id, question_type, cefr_level, question, created_at 
			FROM questions 
			WHERE story_id = $1 AND question_type = $2 AND cefr_level = $3`
	} else if contentType == "News" {
		query = `
			SELECT id, news_id, question_type, cefr_level, question, created_at 
			FROM questions 
			WHERE news_id = $1 AND question_type = $2 AND cefr_level = $3`
	} else {
		return nil, fmt.Errorf("invalid content type: %s", contentType)
	}

	var id int
	var contentRefID string
	var qType, cefr, question string
	var createdAt time.Time

	err := c.db.QueryRow(query, contentID, questionType, cefrLevel).Scan(
		&id,
		&contentRefID,
		&qType,
		&cefr,
		&question,
		&createdAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil // No question found
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query question: %v", err)
	}

	result := map[string]interface{}{
		"id":            id,
		"question_type": qType,
		"cefr_level":    cefr,
		"question":      question,
		"created_at":    createdAt,
	}

	// Add the appropriate content ID field based on type
	if contentType == "Story" {
		result["story_id"] = contentRefID
	} else {
		result["news_id"] = contentRefID
	}

	return result, nil
}

// creates a new question for the given content (story/news)
func (c *Client) CreateContentQuestion(contentType string, contentID string, questionType string, cefrLevel string, question string) error {
	var query string
	if contentType == "Story" {
		query = `
			INSERT INTO questions (story_id, question_type, cefr_level, question)
			VALUES ($1, $2, $3, $4)`
	} else if contentType == "News" {
		query = `
			INSERT INTO questions (news_id, question_type, cefr_level, question)
			VALUES ($1, $2, $3, $4)`
	} else {
		return fmt.Errorf("invalid content type: %s", contentType)
	}

	result, err := c.db.Exec(query, contentID, questionType, cefrLevel, question)
	if err != nil {
		return fmt.Errorf("failed to insert question: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no rows were inserted")
	}

	return nil
}

// retrieves a single content row (news or story) by its ID
func (c *Client) GetContentByID(contentType string, contentID string) (map[string]interface{}, error) {
	var query string
	if contentType == "Story" {
		query = `
			SELECT id, title, language, topic, cefr_level, content, created_at, date_created 
			FROM stories 
			WHERE id = $1`
	} else if contentType == "News" {
		query = `
			SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created 
			FROM news 
			WHERE id = $1`
	} else {
		return nil, fmt.Errorf("invalid content type: %s", contentType)
	}

	var id, title, language, topic, cefrLevel, previewText, content string
	var createdAt time.Time
	var dateCreated sql.NullTime

	err := c.db.QueryRow(query, contentID).Scan(
		&id,
		&title,
		&language,
		&topic,
		&cefrLevel,
		&previewText,
		&createdAt,
		&dateCreated,
	)

	if err == sql.ErrNoRows {
		return nil, nil // No content found
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query content: %v", err)
	}

	result := map[string]interface{}{
		"id":           id,
		"title":        title,
		"language":     language,
		"topic":        topic,
		"cefr_level":   cefrLevel,
		"preview_text": previewText,
		"content":      content,
		"created_at":   createdAt,
		"date_created": dateCreated.Time.Format("2006-01-02"),
	}

	return result, nil
}

func (c *Client) GetProfile(userID string) (*Profile, error) {
	query := `
		SELECT username, learning_language, skill_level, interested_topics, daily_questions_goal 
		FROM profiles 
		WHERE user_id = $1`

	var profile Profile
	err := c.db.QueryRow(query, userID).Scan(
		&profile.Username,
		&profile.LearningLanguage,
		&profile.SkillLevel,
		pq.Array(&profile.InterestedTopics),
		&profile.DailyQuestionsGoal,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query profile: %v", err)
	}

	return &profile, nil
}

func (c *Client) UpsertProfile(userID string, profile *Profile) (int, error) {
	query := `
		INSERT INTO profiles (
			user_id, username, learning_language, skill_level, 
			interested_topics, daily_questions_goal
		) 
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id) 
		DO UPDATE SET 
			username = EXCLUDED.username,
			learning_language = EXCLUDED.learning_language,
			skill_level = EXCLUDED.skill_level,
			interested_topics = EXCLUDED.interested_topics,
			daily_questions_goal = EXCLUDED.daily_questions_goal
		RETURNING id`

	var id int
	err := c.db.QueryRow(
		query,
		userID,
		profile.Username,
		profile.LearningLanguage,
		profile.SkillLevel,
		pq.Array(profile.InterestedTopics),
		profile.DailyQuestionsGoal,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("failed to upsert profile: %v", err)
	}

	return id, nil
}
