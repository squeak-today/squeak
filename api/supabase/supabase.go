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

type QueryParams struct {
	Language        string
	CEFR            string
	Subject         string
	Page            int
	PageSize        int
	ClassroomID     string // if not querying for class, leave as default ""
	WhitelistStatus string // if not querying for whitelist, leave as default ""
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

// set as teacher, student, or none / ""
func (c *Client) CheckAccountType(userID string, accountType string) (bool, error) {
	// teacher check
	exists, err := c.GetTeacherInfo(userID)
	if err != nil {
		return false, fmt.Errorf("failed to check teacher info: %v", err)
	}

	// student check
	studentID, classroomID, err := c.CheckStudentStatus(userID)
	if err != nil {
		return false, fmt.Errorf("failed to check student status: %v", err)
	}

	if accountType == "teacher" {
		return exists, nil
	} else if accountType == "student" {
		return (studentID != "" && classroomID != ""), nil
	} else {
		return (studentID == "" && classroomID == "" && !exists), nil
	}
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

func (c *Client) QueryAllContent(params QueryParams) ([]map[string]interface{}, error) {
	return c.queryContent(params, "All")
}

// helper function called in the QueryNews and QueryStories functions
// builds the SQL query string based on the query params
func (c *Client) queryContent(params QueryParams, contentType string) ([]map[string]interface{}, error) {
	var baseQuery string
	var queryParams []interface{}
	paramCount := 1

	// helper func to build the select part of the query
	buildSelect := func(tableAlias string) string {
		baseSelect := fmt.Sprintf(`
			SELECT 
				%[1]s.id, 
				%[1]s.title, 
				%[1]s.language, 
				%[1]s.topic, 
				%[1]s.cefr_level, 
				%[1]s.preview_text, 
				%[1]s.created_at, 
				%[1]s.date_created`, tableAlias)

		if contentType == "All" {
			return baseSelect + fmt.Sprintf(`,
				(
					SELECT pages 
					FROM stories 
					WHERE stories.id = %[1]s.id 
					AND '%[1]s' = 'stories'
				) as pages,
				CASE 
					WHEN '%[1]s' = 'stories' THEN 'Story'::text 
					ELSE 'News'::text 
				END as content_type`, tableAlias)
		}

		if contentType == "News" {
			return baseSelect
		}

		return baseSelect + fmt.Sprintf(`, %[1]s.pages`, tableAlias)
	}

	if params.ClassroomID != "" {
		if params.WhitelistStatus == "rejected" {
			if contentType == "All" {
				baseQuery = fmt.Sprintf(`
					SELECT * FROM (
						(
							%s
							FROM stories stories
							WHERE NOT EXISTS (
								SELECT 1 FROM accepted_content ac 
								WHERE ac.classroom_id = $1 
								AND ac.story_id = stories.id
							)
						)
						UNION ALL
						(
							%s
							FROM news news
							WHERE NOT EXISTS (
								SELECT 1 FROM accepted_content ac 
								WHERE ac.classroom_id = $1 
								AND ac.news_id = news.id
							)
						)
					) combined_results
					WHERE 1=1`, buildSelect("stories"), buildSelect("news"))
				queryParams = append(queryParams, params.ClassroomID)
				paramCount = 2
			} else if contentType == "Story" {
				baseQuery = fmt.Sprintf(`
					%s
					FROM stories stories
					WHERE NOT EXISTS (
						SELECT 1 FROM accepted_content ac 
						WHERE ac.classroom_id = $1 
						AND ac.story_id = stories.id
					)`, buildSelect("stories"))
			} else {
				baseQuery = fmt.Sprintf(`
					%s
					FROM news news
					WHERE NOT EXISTS (
						SELECT 1 FROM accepted_content ac 
						WHERE ac.classroom_id = $1 
						AND ac.news_id = news.id
					)`, buildSelect("news"))
			}
		} else if params.WhitelistStatus == "accepted" {
			if contentType == "All" {
				baseQuery = fmt.Sprintf(`
					SELECT * FROM (
						(
							%s
							FROM stories stories
							INNER JOIN accepted_content ac ON stories.id = ac.story_id 
							WHERE ac.classroom_id = $1
						)
						UNION ALL
						(
							%s
							FROM news news
							INNER JOIN accepted_content ac ON news.id = ac.news_id 
							WHERE ac.classroom_id = $1
						)
					) combined_results
					WHERE 1=1`, buildSelect("stories"), buildSelect("news"))
			} else if contentType == "Story" {
				baseQuery = fmt.Sprintf(`
					%s
					FROM stories stories
					INNER JOIN accepted_content ac ON stories.id = ac.story_id 
					WHERE ac.classroom_id = $1`, buildSelect("stories"))
			} else {
				baseQuery = fmt.Sprintf(`
					%s
					FROM news news
					INNER JOIN accepted_content ac ON news.id = ac.news_id 
					WHERE ac.classroom_id = $1`, buildSelect("news"))
			}
			queryParams = append(queryParams, params.ClassroomID)
			paramCount = 2
		} else {
			if contentType == "All" {
				baseQuery = fmt.Sprintf(`
					SELECT * FROM (
						(
							%s
							FROM stories stories
							WHERE 1=1
						)
						UNION ALL
						(
							%s
							FROM news news
							WHERE 1=1
						)
					) combined_results
					WHERE 1=1`, buildSelect("stories"), buildSelect("news"))
			} else if contentType == "Story" {
				baseQuery = fmt.Sprintf(`%s FROM stories stories WHERE 1=1`, buildSelect("stories"))
			} else {
				baseQuery = fmt.Sprintf(`%s FROM news news WHERE 1=1`, buildSelect("news"))
			}
		}
	} else {
		if contentType == "All" {
			baseQuery = fmt.Sprintf(`
				SELECT * FROM (
					(
						%s
						FROM stories stories
						WHERE 1=1
					)
					UNION ALL
					(
						%s
						FROM news news
						WHERE 1=1
					)
				) combined_results
				WHERE 1=1`, buildSelect("stories"), buildSelect("news"))
		} else if contentType == "Story" {
			baseQuery = fmt.Sprintf(`%s FROM stories stories WHERE 1=1`, buildSelect("stories"))
		} else {
			baseQuery = fmt.Sprintf(`%s FROM news news WHERE 1=1`, buildSelect("news"))
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

	fmt.Println(baseQuery)
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
		var contentTypeStr sql.NullString

		var scanArgs []interface{}
		scanArgs = append(scanArgs,
			&id, &title, &language, &topic, &cefrLevel,
			&previewText, &createdAt, &dateCreated)

		// add scan fields based on content type
		if contentType == "All" {
			scanArgs = append(scanArgs, &pages, &contentTypeStr) // since if its All, then content type is an additional column
		} else if contentType == "Story" {
			scanArgs = append(scanArgs, &pages) // similarly, pages is here
		}

		if err := rows.Scan(scanArgs...); err != nil {
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

		// add pages for Story or All content type
		if contentType == "Story" || contentType == "All" {
			if pages.Valid {
				result["pages"] = pages.Int32
			} else {
				result["pages"] = nil
			}
		}

		// Add content_type for All content type
		if contentType == "All" {
			result["content_type"] = contentTypeStr.String
		}

		results = append(results, result)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
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

func (c *Client) GetTeacherInfo(teacherID string) (bool, error) {
	var exists bool
	err := c.db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 
			FROM classrooms
			WHERE teacher_id = $1 
	)`, teacherID).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}

func (c *Client) GetClassroomById(classroomID string) (string, int, error) {
	var teacher_id string
	var students_count int
	err := c.db.QueryRow(`
		SELECT teacher_id, student_count
		FROM classrooms
		WHERE id = $1
	`, classroomID).Scan(&teacher_id, &students_count)

	if err != nil {
		return "", 0, err
	}

	return teacher_id, students_count, nil
}

func (c *Client) GetClassroomByTeacherId(userID string) (string, int, error) {
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

func (c *Client) CheckStudentStatus(userID string) (string, string, error) {
	var studentID string
	var classroomID string
	err := c.db.QueryRow(`
		SELECT student_id, classroom_id
		FROM students
		WHERE user_id = $1
	`, userID).Scan(&studentID, &classroomID)

	if err == sql.ErrNoRows {
		return "", "", nil
	}
	if err != nil {
		return "", "", fmt.Errorf("failed to check student status: %v", err)
	}

	return studentID, classroomID, nil
}

func (c *Client) CreateClassroom(userID string, student_count int) (string, error) {
	var classroomID string
	err := c.db.QueryRow(`
		INSERT INTO classrooms (teacher_id, student_count)
		VALUES ($1, $2)
		ON CONFLICT (teacher_id) DO NOTHING
		RETURNING id
	`, userID, student_count).Scan(&classroomID)

	if err == sql.ErrNoRows {
		return "", fmt.Errorf("failed to create classroom: Teacher already has a classroom")
	}

	if err != nil {
		return "", fmt.Errorf("failed to create classroom: %v", err)
	}

	return classroomID, nil
}

func (c *Client) AddStudentToClassroom(classroomID string, studentID string) error {
	_, err := c.db.Exec(`
		INSERT INTO students (user_id, classroom_id)
		VALUES ($1, $2)
	`, studentID, classroomID)

	if err != nil {
		return fmt.Errorf("failed to add student to classroom: %v", err)
	}

	return nil
}

func (c *Client) AcceptContent(classroomID int, contentType string, contentID int) error {
	var query string

	if contentType == "Story" {
		query = `
            INSERT INTO accepted_content (classroom_id, story_id)
            VALUES ($1, $2)
            ON CONFLICT (classroom_id, story_id) DO NOTHING
        `
	} else if contentType == "News" {
		query = `
            INSERT INTO accepted_content (classroom_id, news_id)
            VALUES ($1, $2)
            ON CONFLICT (classroom_id, news_id) DO NOTHING
        `
	} else {
		return fmt.Errorf("invalid content type: %s", contentType)
	}

	_, err := c.db.Exec(query, classroomID, contentID)
	if err != nil {
		return fmt.Errorf("failed to accept content: %v", err)
	}

	return nil
}

func (c *Client) RejectContent(classroomID int, contentType string, contentID int) error {
	var query string
	if contentType == "Story" {
		query = `
            DELETE FROM accepted_content 
            WHERE classroom_id = $1 AND story_id = $2
        `
	} else if contentType == "News" {
		query = `
            DELETE FROM accepted_content 
            WHERE classroom_id = $1 AND news_id = $2
        `
	} else {
		return fmt.Errorf("invalid content type: %s", contentType)
	}

	result, err := c.db.Exec(query, classroomID, contentID)
	if err != nil {
		return fmt.Errorf("failed to reject content: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("content was not accepted in classroom")
	}

	return nil
}
