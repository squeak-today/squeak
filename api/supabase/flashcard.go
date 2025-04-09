// supabase/flashcard.go
package supabase

import (
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
	Confidence   int       `json:"confidence"`
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
		SELECT * FROM flashcards 
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
		if err := rows.Scan(&flashcard.ID, &flashcard.DeckID, &flashcard.FrontContent, &flashcard.BackContent, &flashcard.SourceURL, &flashcard.LastReviewed, &flashcard.ReviewCount, &flashcard.Confidence, &flashcard.CreatedAt, &flashcard.UpdatedAt); err != nil {
			return nil, err
		}
		flashcards = append(flashcards, flashcard)
	}

	return flashcards, nil
}

// GetFlashcard retrieves a specific flashcard by ID
func (c *Client) GetFlashcard(flashcardID int) (Flashcard, error) {
	var flashcard Flashcard

	query := `
		SELECT * FROM flashcards 
		WHERE id = $1
	`

	err := c.db.QueryRow(query, flashcardID).Scan(&flashcard.ID, &flashcard.DeckID, &flashcard.FrontContent, &flashcard.BackContent, &flashcard.SourceURL, &flashcard.LastReviewed, &flashcard.ReviewCount, &flashcard.Confidence, &flashcard.CreatedAt, &flashcard.UpdatedAt)
	if err != nil {
		return Flashcard{}, err
	}

	return flashcard, nil
}

func (c *Client) CreateFlashcard(flashcard Flashcard) (Flashcard, error) {
    query := `
        INSERT INTO flashcards 
        (deck_id, front_content, back_content, source_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, deck_id, front_content, back_content, source_url, 
                  last_reviewed, review_count, confidence, created_at, updated_at
    `
    var createdFlashcard Flashcard
    err := c.db.QueryRow(query, flashcard.DeckID, flashcard.FrontContent, flashcard.BackContent, flashcard.SourceURL).Scan(
        &createdFlashcard.ID, &createdFlashcard.DeckID, &createdFlashcard.FrontContent, &createdFlashcard.BackContent,
        &createdFlashcard.SourceURL, &createdFlashcard.LastReviewed, &createdFlashcard.ReviewCount,
        &createdFlashcard.Confidence, &createdFlashcard.CreatedAt, &createdFlashcard.UpdatedAt)
    if err != nil {
        return Flashcard{}, err
    }
    return createdFlashcard, nil
}

// UpdateFlashcard updates a flashcard's content
func (c *Client) UpdateFlashcard(flashcard Flashcard) (Flashcard, error) {
	query := `
		UPDATE flashcards
		SET front_content = $1, back_content = $2, updated_at = now()
		WHERE id = $3
		RETURNING *
	`

	var updatedFlashcard Flashcard
	err := c.db.QueryRow(query, flashcard.FrontContent, flashcard.BackContent, flashcard.ID).Scan(
		&updatedFlashcard.ID, &updatedFlashcard.DeckID, &updatedFlashcard.FrontContent, &updatedFlashcard.BackContent,
		&updatedFlashcard.SourceURL, &updatedFlashcard.LastReviewed, &updatedFlashcard.ReviewCount,
		&updatedFlashcard.Confidence, &updatedFlashcard.CreatedAt, &updatedFlashcard.UpdatedAt)
	if err != nil {
		return Flashcard{}, err
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
