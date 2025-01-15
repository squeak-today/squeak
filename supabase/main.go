package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func insertContent(db *sql.DB, table string, title, language, topic, cefrLevel, preview_text string) error {
	query := fmt.Sprintf(`
        INSERT INTO %s (title, language, topic, cefr_level, preview_text, created_at, date_created)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT ON CONSTRAINT unique_%s_entry
        DO UPDATE SET
            title = EXCLUDED.title,
            preview_text = EXCLUDED.preview_text,
            created_at = NOW()
    `, table, table)

	_, err := db.Exec(query, title, language, topic, cefrLevel, preview_text)
	if err != nil {
		return fmt.Errorf("failed to insert news: %v", err)
	}

	return nil
}

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found") // loading env file
	}
}

func generateTestData(db *sql.DB) error {
	languages := []string{"French", "Spanish"}
	cefrLevels := []string{"A1", "A2", "B1", "B2", "C1", "C2"}
	topics := []string{"Sports", "Politics", "Finance"}

	// create 6 consecutive dates from Dec 10-15, 2024
	dates := make([]time.Time, 6)
	baseDate := time.Date(2024, 12, 10, 12, 0, 0, 0, time.UTC)
	for i := range dates {
		dates[i] = baseDate.AddDate(0, 0, i) // add i days instead of subtracting weeks
	}

	for _, lang := range languages {
		for _, cefr := range cefrLevels {
			for _, topic := range topics {
				for dateIndex, date := range dates {
					for i := 0; i < 3; i++ {
						title := fmt.Sprintf("%s %s News #%d - %s (%s)",
							lang, topic, dateIndex*3+i+1, cefr, date.Format("2006-01-02"))

						preview := fmt.Sprintf("This is a %s language %s article suitable for %s level readers. Created on %s",
							lang, topic, cefr, date.Format("2006-01-02"))

						query := `
                            INSERT INTO news (title, language, topic, cefr_level, preview_text, created_at, date_created)
                            VALUES ($1, $2, $3, $4, $5, NOW(), $6)
                            ON CONFLICT ON CONSTRAINT unique_news_entry
                            DO UPDATE SET
                                title = EXCLUDED.title,
                                preview_text = EXCLUDED.preview_text,
                                created_at = EXCLUDED.created_at,
                                date_created = EXCLUDED.date_created`

						_, err := db.Exec(query, title, lang, topic, cefr, preview, date)
						if err != nil {
							log.Printf("Failed to insert row: lang=%s, topic=%s, cefr=%s, date=%s, error: %v",
								lang, topic, cefr, date.Format("2006-01-02"), err)
							return fmt.Errorf("failed to insert test data: %v", err)
						}
					}
				}
			}
		}
	}

	return nil
}

func main() {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		os.Getenv("SUPABASE_HOST"),
		os.Getenv("SUPABASE_PORT"),
		os.Getenv("SUPABASE_USER"),
		os.Getenv("SUPABASE_PASSWORD"),
		os.Getenv("SUPABASE_DATABASE"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer db.Close()

	if err := generateTestData(db); err != nil {
		log.Fatal("Failed to generate test data:", err)
	}

	// insertContent(db, "news", "Global Warming Effects", "english", "science", "B1", "This is a news article of Global Warming Effects")
	// insertContent(db, "stories", "Global Warming Effects", "english", "science", "B1", "This is a story of Global Warming Effects")

	// Example values - replace with your desired filters
	language := "French"
	cefr := "any"
	subject := "any"

	// Build query dynamically
	query := "SELECT id, title, language, topic, cefr_level, preview_text, created_at, date_created FROM news WHERE 1=1"
	var params []interface{}
	paramCount := 1

	if language != "" && language != "any" {
		query += fmt.Sprintf(" AND language = $%d", paramCount)
		params = append(params, language)
		paramCount++
	}

	if cefr != "" && cefr != "any" {
		query += fmt.Sprintf(" AND cefr_level = $%d", paramCount)
		params = append(params, cefr)
		paramCount++
	}

	if subject != "" && subject != "any" {
		query += fmt.Sprintf(" AND topic = $%d", paramCount)
		params = append(params, subject)
	}

	rows, err := db.Query(query, params...)
	if err != nil {
		log.Fatal("Query execution failed:", err)
	}
	defer rows.Close()

	// Print results
	for rows.Next() {
		var id, title, language, topic, cefrLevel, previewText string
		var createdAt time.Time
		var dateCreated sql.NullTime

		if err := rows.Scan(&id, &title, &language, &topic, &cefrLevel, &previewText, &createdAt, &dateCreated); err != nil {
			log.Fatal("Data scanning failed:", err)
		}

		fmt.Printf("ID: %s, Title: %s, Language: %s, Topic: %s, CEFR: %s, Created: %s, Date: %s\n",
			id, title, language, topic, cefrLevel, createdAt, dateCreated.Time.Format("2006-01-02"))
	}
}
