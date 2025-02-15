package supabase

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/stdlib"
	"github.com/lib/pq"
)

// supabase database client
type Client struct {
	db *sql.DB
}

// QueryParams: query parameters for story-query and news-query endpoints
type QueryParams struct {
	Language    string
	CEFR        string
	Subject     string
	Page        int
	PageSize    int
	ClassroomID string
}

// Add these near the top with other type definitions
type Profile struct {
	Username           string   `json:"username"`
	LearningLanguage   string   `json:"learning_language"`
	SkillLevel         string   `json:"skill_level"`
	InterestedTopics   []string `json:"interested_topics"`
	DailyQuestionsGoal int      `json:"daily_questions_goal"`
}

type DailyProgress struct {
	UserID             string    `json:"user_id"`
	Date               time.Time `json:"date"`
	QuestionsCompleted int       `json:"questions_completed"`
	GoalMet            bool      `json:"goal_met"`
}

func NewClient() (*Client, error) {
	// Create a pgx connection config
	// postgresql://postgres.hmwqjuylgsoytagxgoyq:[YOUR-PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres
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

func (c *Client) CheckStudentStatus(userID string) (string, error) {
	var classroomID string
	err := c.db.QueryRow(`
		SELECT classroom_id
		FROM students
		WHERE user_id = $1
	`, userID).Scan(&classroomID)

	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to check student status: %v", err)
	}

	return classroomID, nil
}

func (c *Client) CheckAcceptedContent(classroomID string, contentType string, contentID string) (bool, error) {
	var exists bool
	var query string

	if contentType == "Story" {
		query = `
			SELECT EXISTS (
				SELECT 1 
				FROM accepted_content 
				WHERE classroom_id = $1 
				AND story_id = $2
			)`
	} else if contentType == "News" {
		query = `
			SELECT EXISTS (
				SELECT 1 
				FROM accepted_content 
				WHERE classroom_id = $1 
				AND news_id = $2
			)`
	} else {
		return false, fmt.Errorf("invalid content type: %s", contentType)
	}

	err := c.db.QueryRow(query, classroomID, contentID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check accepted content: %v", err)
	}

	return exists, nil
}

func (c *Client) QueryNews(params QueryParams) ([]map[string]interface{}, error) {
	return c.queryContent(params, "News")
}

func (c *Client) QueryStories(params QueryParams) ([]map[string]interface{}, error) {
	return c.queryContent(params, "Story")
}

// helper function called in the QueryNews and QueryStories functions
// builds the SQL query string based on the query params
func (c *Client) queryContent(params QueryParams, contentType string) ([]map[string]interface{}, error) {
	var baseQuery string
	var queryParams []interface{}
	paramCount := 1

	if params.ClassroomID != "" {
		if contentType == "Story" {
			baseQuery = `
				SELECT n.id, n.title, n.language, n.topic, n.cefr_level, n.preview_text, n.created_at, n.date_created, n.pages 
				FROM stories n
				INNER JOIN accepted_content ac ON n.id = ac.story_id 
				WHERE ac.classroom_id = $1`
		} else {
			baseQuery = `
				SELECT n.id, n.title, n.language, n.topic, n.cefr_level, n.preview_text, n.created_at, n.date_created 
				FROM news n
				INNER JOIN accepted_content ac ON n.id = ac.news_id 
				WHERE ac.classroom_id = $1`
		}
		queryParams = append(queryParams, params.ClassroomID)
		paramCount = 2
	} else {
		if contentType == "Story" {
			baseQuery = `SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created, pages FROM stories WHERE 1=1`
		} else {
			baseQuery = `SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created FROM news WHERE 1=1`
		}
	}

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
		var pages sql.NullInt32

		var err error
		if contentType == "Story" {
			err = rows.Scan(&id, &title, &language, &topic, &cefrLevel, &previewText, &createdAt, &dateCreated, &pages)
		} else {
			err = rows.Scan(&id, &title, &language, &topic, &cefrLevel, &previewText, &createdAt, &dateCreated)
		}

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
			"pages":        pages.Int32,
		}

		if contentType == "Story" {
			result["pages"] = pages.Int32
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
			SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created, pages 
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
	var pages int

	var scanArgs []interface{}
	scanArgs = append(scanArgs, &id, &title, &language, &topic, &cefrLevel, &previewText, &createdAt, &dateCreated)
	if contentType == "Story" {
		scanArgs = append(scanArgs, &pages)
	}

	err := c.db.QueryRow(query, contentID).Scan(scanArgs...)

	if err == sql.ErrNoRows {
		return nil, nil
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

	if contentType == "Story" {
		result["pages"] = pages
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
		return nil, sql.ErrNoRows
	}
	if err != nil {
		return nil, fmt.Errorf("database error querying profile: %v", err)
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

func (c *Client) GetTodayProgress(userID string) (*DailyProgress, error) {
	var progress DailyProgress
	err := c.db.QueryRow(`
        SELECT user_id, date, questions_completed, goal_met
        FROM daily_progress
        WHERE user_id = $1 AND date = CURRENT_DATE
    `, userID).Scan(&progress.UserID, &progress.Date, &progress.QuestionsCompleted, &progress.GoalMet)

	if err == sql.ErrNoRows {
		err = c.db.QueryRow(`
            INSERT INTO daily_progress (user_id, date)
            VALUES ($1, CURRENT_DATE)
            RETURNING user_id, date, questions_completed, goal_met
        `, userID).Scan(&progress.UserID, &progress.Date, &progress.QuestionsCompleted, &progress.GoalMet)
	}

	if err != nil {
		return nil, err
	}
	return &progress, nil
}

func (c *Client) IncrementQuestionsCompleted(userID string, amount int) error {
	var dailyGoal int
	err := c.db.QueryRow(`
        SELECT daily_questions_goal 
        FROM profiles 
        WHERE user_id = $1
    `, userID).Scan(&dailyGoal)
	if err != nil {
		return fmt.Errorf("failed to get daily goal: %v", err)
	}

	// not sure why but a CTE is needed here literally just for the increment_by amount
	// if it doesn't it complains about inconsistent types but everything is an integer so idk
	query := `
        WITH new_amount AS (
            SELECT $2::INTEGER as increment_by
        )
        INSERT INTO daily_progress (user_id, date, questions_completed, goal_met)
        VALUES (
            $1, 
            CURRENT_DATE, 
            (SELECT increment_by FROM new_amount), 
            (SELECT increment_by FROM new_amount) >= $3
        )
        ON CONFLICT (user_id, date) 
        DO UPDATE SET 
            questions_completed = daily_progress.questions_completed + (SELECT increment_by FROM new_amount),
            goal_met = ((daily_progress.questions_completed + (SELECT increment_by FROM new_amount)) >= $3)
    `

	_, err = c.db.Exec(query, userID, amount, dailyGoal)
	return err
}

func (c *Client) GetProgressStreak(userID string) (int, bool, error) {
	var streak int
	var completedToday bool
	err := c.db.QueryRow(`
		WITH consecutive_days AS (
			SELECT
				date,
				goal_met,
				date - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY date ASC) AS streak_group
			FROM daily_progress
			WHERE user_id = $1
				AND goal_met = TRUE
			ORDER BY date
		),

		streak_groups AS (
			SELECT
				MIN(date) AS start_at,
				MAX(date) AS end_at,
				COUNT(*) AS days_count,
				(CURRENT_DATE - INTERVAL '1 day')::DATE AS day_before_end,
				MAX(date) = CURRENT_DATE AS completed_for_today,
				MAX(date) = (CURRENT_DATE - INTERVAL '1 day')::DATE AS completed_for_yesterday,
				MAX(date) - (MIN(date) - INTERVAL '1 day')::DATE AS streak_size
			FROM consecutive_days
			GROUP BY streak_group
			HAVING COUNT(*) >= 1
		)

		SELECT 
		COALESCE(
			(SELECT streak_size 
				FROM streak_groups 
				WHERE completed_for_today = true 
				OR completed_for_yesterday = true
				ORDER BY streak_size DESC 
				LIMIT 1), 0
		) as current_streak,
		COALESCE(
			(SELECT completed_for_today 
				FROM streak_groups 
				WHERE completed_for_today = true 
				OR completed_for_yesterday = true
				ORDER BY streak_size DESC 
				LIMIT 1), false
		) as completed_today;
	`, userID).Scan(&streak, &completedToday)

	if err != nil {
		return 0, false, err
	}
	return streak, completedToday, nil
}

func (c *Client) GetClassroom(userID string) (string, int, error) {
	var classroom_id string
	var students_count int
	err := c.db.QueryRow(`
		SELECT id, student_count
		FROM classrooms
		WHERE teacher_id = $1
	`, userID).Scan(&classroom_id, &students_count)

	if err != nil {
		return "", 0, err
	}

	return classroom_id, students_count, nil
}

func (c *Client) CreateClassroom(userID string, student_count int) (string, error) {
	var classroomID string
	err := c.db.QueryRow(`
		INSERT INTO classrooms (teacher_id, student_count)
		VALUES ($1, $2)
		RETURNING id
	`, userID, student_count).Scan(&classroomID)

	if err != nil {
		return "", fmt.Errorf("failed to create classroom: %v", err)
	}

	return classroomID, nil
}
