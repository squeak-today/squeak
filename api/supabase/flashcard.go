// supabase/flashcard.go
package supabase

import (
	"database/sql"
	"log"
	"time"
)

type Flashcard struct {
	ID           int       `json:"id"`
	DeckID       int       `json:"deck_id"`
	FrontContent string    `json:"front_content"`
	BackContent  string    `json:"back_content"`
	SourceURL    string    `json:"source_url"`
	LastReviewed time.Time `json:"last_reviewed"`
	ReviewCount  int       `json:"review_count"`
	Confidence   int       `json:"confidence_level"` // Make sure this matches your DB column name
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type FlashcardCreate struct {
	DeckID       int    `json:"deck_id" binding:"required"`
	FrontContent string `json:"front_content" binding:"required"`
	BackContent  string `json:"back_content" binding:"required"`
	SourceURL    string `json:"source_url"`
}

type FlashcardUpdate struct {
	FrontContent string `json:"front_content" binding:"required"`
	BackContent  string `json:"back_content" binding:"required"`
}

// GetFlashcardsByDeckID retrieves all flashcards in a deck
func (c *Client) GetFlashcardsByDeckID(deckID int) ([]Flashcard, error) {
	var flashcards []Flashcard

	query := `
        SELECT id, deck_id, front_content, back_content, source_url, 
               last_reviewed, review_count, confidence_level, created_at, updated_at 
        FROM flashcards 
        WHERE deck_id = $1
        ORDER BY created_at DESC
    `

	rows, err := c.db.Query(query, deckID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var flashcard Flashcard
		var lastReviewedSQL sql.NullTime // Handle NULL values for last_reviewed

		if err := rows.Scan(
			&flashcard.ID,
			&flashcard.DeckID,
			&flashcard.FrontContent,
			&flashcard.BackContent,
			&flashcard.SourceURL,
			&lastReviewedSQL,
			&flashcard.ReviewCount,
			&flashcard.Confidence, // This should match confidence_level column
			&flashcard.CreatedAt,
			&flashcard.UpdatedAt); err != nil {
			return nil, err
		}

		// Convert sql.NullTime to time.Time
		if lastReviewedSQL.Valid {
			flashcard.LastReviewed = lastReviewedSQL.Time
		}

		flashcards = append(flashcards, flashcard)
	}

	// Handle empty result case
	if len(flashcards) == 0 {
		return []Flashcard{}, nil // Return empty slice instead of nil
	}

	return flashcards, nil
}

func (c *Client) GetFlashcard(flashcardID int) (Flashcard, error) {
	var flashcard Flashcard
	var lastReviewedSQL sql.NullTime

	query := `
        SELECT id, deck_id, front_content, back_content, source_url, 
               last_reviewed, review_count, confidence_level, created_at, updated_at 
        FROM flashcards 
        WHERE id = $1
    `

	err := c.db.QueryRow(query, flashcardID).Scan(
		&flashcard.ID,
		&flashcard.DeckID,
		&flashcard.FrontContent,
		&flashcard.BackContent,
		&flashcard.SourceURL,
		&lastReviewedSQL,
		&flashcard.ReviewCount,
		&flashcard.Confidence,
		&flashcard.CreatedAt,
		&flashcard.UpdatedAt)

	if err != nil {
		return Flashcard{}, err
	}

	// Convert sql.NullTime to time.Time
	if lastReviewedSQL.Valid {
		flashcard.LastReviewed = lastReviewedSQL.Time
	}

	return flashcard, nil
}

func (c *Client) CreateFlashcard(flashcard Flashcard) (Flashcard, error) {
	var createdFlashcard Flashcard
	var lastReviewedSQL sql.NullTime

	query := `
        INSERT INTO flashcards 
        (deck_id, front_content, back_content, source_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, deck_id, front_content, back_content, source_url, 
                  last_reviewed, review_count, confidence_level, created_at, updated_at
    `

	err := c.db.QueryRow(query,
		flashcard.DeckID,
		flashcard.FrontContent,
		flashcard.BackContent,
		flashcard.SourceURL).Scan(
		&createdFlashcard.ID,
		&createdFlashcard.DeckID,
		&createdFlashcard.FrontContent,
		&createdFlashcard.BackContent,
		&createdFlashcard.SourceURL,
		&lastReviewedSQL,
		&createdFlashcard.ReviewCount,
		&createdFlashcard.Confidence,
		&createdFlashcard.CreatedAt,
		&createdFlashcard.UpdatedAt)

	if err != nil {
		log.Printf("Error creating flashcard: %v", err)
		return Flashcard{}, err
	}

	// Convert sql.NullTime to time.Time
	if lastReviewedSQL.Valid {
		createdFlashcard.LastReviewed = lastReviewedSQL.Time
	}

	return createdFlashcard, nil
}

func (c *Client) UpdateFlashcard(flashcard Flashcard) (Flashcard, error) {
	var updatedFlashcard Flashcard
	var lastReviewedSQL sql.NullTime

	query := `
        UPDATE flashcards
        SET front_content = $1, back_content = $2, updated_at = now()
        WHERE id = $3
        RETURNING id, deck_id, front_content, back_content, source_url, 
                  last_reviewed, review_count, confidence_level, created_at, updated_at
    `

	err := c.db.QueryRow(query,
		flashcard.FrontContent,
		flashcard.BackContent,
		flashcard.ID).Scan(
		&updatedFlashcard.ID,
		&updatedFlashcard.DeckID,
		&updatedFlashcard.FrontContent,
		&updatedFlashcard.BackContent,
		&updatedFlashcard.SourceURL,
		&lastReviewedSQL,
		&updatedFlashcard.ReviewCount,
		&updatedFlashcard.Confidence,
		&updatedFlashcard.CreatedAt,
		&updatedFlashcard.UpdatedAt)

	if err != nil {
		log.Printf("Error updating flashcard: %v", err)
		return Flashcard{}, err
	}

	// Convert sql.NullTime to time.Time
	if lastReviewedSQL.Valid {
		updatedFlashcard.LastReviewed = lastReviewedSQL.Time
	}

	return updatedFlashcard, nil
}

// DeleteFlashcard deletes a flashcard
func (c *Client) DeleteFlashcard(flashcardID int) error {
	query := `
		DELETE FROM flashcards
		WHERE id = $1
	`

	_, err := c.db.Exec(query, flashcardID)
	if err != nil {
		return err
	}

	return nil
}
