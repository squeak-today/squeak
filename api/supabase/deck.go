// supabase/deck.go
package supabase

import (
	"time"
)

type Deck struct {
	ID          int       `json:"id"`
	UserID      string    `json:"user_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsPublic    bool      `json:"is_public"`
	IsSystem    bool      `json:"is_system"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DeckCreate struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type DeckWithCards struct {
	ID          int         `json:"id"`
	UserID      string      `json:"user_id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	IsPublic    bool        `json:"is_public"`
	IsSystem    bool        `json:"is_system"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	Flashcards  []Flashcard `json:"flashcards"`
}

// GetDecks retrieves all decks accessible to the user
func (c *Client) GetDecks(userID string) ([]Deck, error) {
	var decks []Deck

	// Query personal decks + system decks
	query := `
		SELECT * FROM decks 
		WHERE user_id = $1 OR is_public = true 
		ORDER BY is_system DESC, created_at DESC
	`

	rows, err := c.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var deck Deck
		if err := rows.Scan(&deck.ID, &deck.UserID, &deck.Name, &deck.Description, &deck.IsPublic, &deck.IsSystem, &deck.CreatedAt, &deck.UpdatedAt); err != nil {
			return nil, err
		}
		decks = append(decks, deck)
	}

	return decks, nil
}

// GetDeck retrieves a specific deck by ID
func (c *Client) GetDeck(deckID int, userID string) (Deck, error) {
	var deck Deck

	query := `
		SELECT * FROM decks 
		WHERE id = $1 AND (user_id = $2 OR is_public = true)
	`

	err := c.db.QueryRow(query, deckID, userID).Scan(&deck.ID, &deck.UserID, &deck.Name, &deck.Description, &deck.IsPublic, &deck.IsSystem, &deck.CreatedAt, &deck.UpdatedAt)
	if err != nil {
		return Deck{}, err
	}

	return deck, nil
}

// GetDeckWithCards retrieves a deck with all its flashcards
func (c *Client) GetDeckWithCards(deckID int, userID string) (DeckWithCards, error) {
	var deckWithCards DeckWithCards

	// First get the deck
	deck, err := c.GetDeck(deckID, userID)
	if err != nil {
		return DeckWithCards{}, err
	}

	// Get all flashcards for this deck
	flashcards, err := c.GetFlashcardsByDeckID(deckID)
	if err != nil {
		return DeckWithCards{}, err
	}

	// Combine into response
	deckWithCards = DeckWithCards{
		ID:          deck.ID,
		UserID:      deck.UserID,
		Name:        deck.Name,
		Description: deck.Description,
		IsPublic:    deck.IsPublic,
		IsSystem:    deck.IsSystem,
		CreatedAt:   deck.CreatedAt,
		UpdatedAt:   deck.UpdatedAt,
		Flashcards:  flashcards,
	}

	return deckWithCards, nil
}

// CreateDeck creates a new deck
func (c *Client) CreateDeck(deck Deck) (Deck, error) {
	query := `
		INSERT INTO decks (user_id, name, description, is_public, is_system)
		VALUES ($1, $2, $3, $4, false)
		RETURNING *
	`
	var createdDeck Deck
	err := c.db.QueryRow(query, deck.UserID, deck.Name, deck.Description, deck.IsPublic).Scan(
		&createdDeck.ID, 
		&createdDeck.UserID, 
		&createdDeck.Name, 
		&createdDeck.Description, 
		&createdDeck.IsPublic, 
		&createdDeck.IsSystem, 
		&createdDeck.CreatedAt, 
		&createdDeck.UpdatedAt)
	if err != nil {
		return Deck{}, err
	}

	return createdDeck, nil
}

// DeleteDeck deletes a deck and all associated flashcards
func (c *Client) DeleteDeck(deckID int, userID string) error {
	query := `
		DELETE FROM decks
		WHERE id = $1 AND user_id = $2 AND is_system = false
	`

	_, err := c.db.Exec(query, deckID, userID)
	if err != nil {
		return err
	}

	return nil
}
