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
        INSERT INTO %s (title, language, topic, cefr_level, preview_text, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
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


	// insertContent(db, "news", "Global Warming Effects", "english", "science", "B1", "This is a news article of Global Warming Effects")
	// insertContent(db, "stories", "Global Warming Effects", "english", "science", "B1", "This is a story of Global Warming Effects")
    
	// Example values - replace with your desired filters
    language := "French"
    cefr := "any"
    subject := "any"

    // Build query dynamically
    query := "SELECT id, title, language, topic, cefr_level, preview_text, created_at FROM news WHERE 1=1"
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
        var id, title, language, topic, cefrLevel string
        var createdAt time.Time
        
        if err := rows.Scan(&id, &title, &language, &topic, &cefrLevel, &createdAt); err != nil {
            log.Fatal("Data scanning failed:", err)
        }

        fmt.Printf("ID: %s, Title: %s, Language: %s, Topic: %s, CEFR: %s, Created: %s\n",
            id, title, language, topic, cefrLevel, createdAt)
    }
}