// handlers/flashcardhandler/flashcard.go
package flashcardhandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"story-api/supabase"
)

type Handler struct {
	db *supabase.Client
}

func New(db *supabase.Client) *Handler {
	return &Handler{db: db}
}

// CreateFlashcard godoc
// @Summary Create a new flashcard
// @Description Creates a new flashcard in the specified deck
// @Tags flashcard
// @Accept json
// @Produce json
// @Param flashcard body supabase.FlashcardCreate true "Flashcard Info"
// @Success 201 {object} supabase.Flashcard
// @Failure 400 {object} gin.H
// @Failure 403 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /flashcard/create [post]
func (h *Handler) CreateFlashcard(c *gin.Context) {
	userID := c.GetString("sub")

	var flashcardCreate supabase.FlashcardCreate
	if err := c.ShouldBindJSON(&flashcardCreate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Verify deck exists and user has access
	deck, err := h.db.GetDeck(flashcardCreate.DeckID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deck not found"})
		return
	}

	// Prevent adding cards to system decks
	if deck.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot add cards to system decks"})
		return
	}
	
	// Prevent adding cards to public decks
	if deck.IsPublic {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot add cards to public decks"})
		return
	}
	
	// Verify user owns the deck (extra protection)
	if deck.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only add cards to your own decks"})
		return
	}

	flashcard := supabase.Flashcard{
		DeckID:       flashcardCreate.DeckID,
		FrontContent: flashcardCreate.FrontContent,
		BackContent:  flashcardCreate.BackContent,
		SourceURL:    flashcardCreate.SourceURL,
	}

	createdFlashcard, err := h.db.CreateFlashcard(flashcard)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create flashcard"})
		return
	}

	c.JSON(http.StatusCreated, createdFlashcard)
}

// UpdateFlashcard godoc
// @Summary Update a flashcard
// @Description Updates an existing flashcard's content
// @Tags flashcard
// @Accept json
// @Produce json
// @Param id path int true "Flashcard ID"
// @Param flashcard body supabase.FlashcardUpdate true "Updated Flashcard Info"
// @Success 200 {object} supabase.Flashcard
// @Failure 400 {object} gin.H
// @Failure 403 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /flashcard/{id}/update [post]
func (h *Handler) UpdateFlashcard(c *gin.Context) {
	userID := c.GetString("sub")
	flashcardIDStr := c.Param("id")
	
	flashcardID, err := strconv.Atoi(flashcardIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flashcard ID"})
		return
	}

	var flashcardUpdate supabase.FlashcardUpdate
	if err := c.ShouldBindJSON(&flashcardUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Verify flashcard exists and user has access
	flashcard, err := h.db.GetFlashcard(flashcardID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flashcard not found"})
		return
	}

	// Verify user owns the deck
	deck, err := h.db.GetDeck(flashcard.DeckID, userID)
	if err != nil || deck.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to this flashcard"})
		return
	}

	// Prevent updating cards in system decks
	if deck.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot modify cards in system decks"})
		return
	}
	
	// Prevent updating cards in public decks
	if deck.IsPublic {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot modify cards in public decks"})
		return
	}

	// Update fields
	flashcard.FrontContent = flashcardUpdate.FrontContent
	flashcard.BackContent = flashcardUpdate.BackContent

	updatedFlashcard, err := h.db.UpdateFlashcard(flashcard)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update flashcard"})
		return
	}

	c.JSON(http.StatusOK, updatedFlashcard)
}

// DeleteFlashcard godoc
// @Summary Delete a flashcard
// @Description Deletes a flashcard by ID
// @Tags flashcard
// @Accept json
// @Produce json
// @Param id path int true "Flashcard ID"
// @Success 200 {object} gin.H
// @Failure 400 {object} gin.H
// @Failure 403 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /flashcard/{id}/delete [post]
func (h *Handler) DeleteFlashcard(c *gin.Context) {
	userID := c.GetString("sub")
	flashcardIDStr := c.Param("id")
	
	flashcardID, err := strconv.Atoi(flashcardIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flashcard ID"})
		return
	}

	// Verify flashcard exists
	flashcard, err := h.db.GetFlashcard(flashcardID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flashcard not found"})
		return
	}

	// Verify user owns the deck
	deck, err := h.db.GetDeck(flashcard.DeckID, userID)
	if err != nil || deck.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to this flashcard"})
		return
	}

	// Prevent deleting cards in system decks
	if deck.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete cards in system decks"})
		return
	}
	
	// Prevent deleting cards in public decks
	if deck.IsPublic {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete cards in public decks"})
		return
	}

	if err := h.db.DeleteFlashcard(flashcardID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete flashcard"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Flashcard deleted successfully"})
}