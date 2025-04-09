// handlers/deckhandler/deck.go
package deckhandler

import (
	"log"
	"net/http"
	"strconv"

	"story-api/supabase"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	db *supabase.Client
}

func New(db *supabase.Client) *Handler {
	return &Handler{db: db}
}

// GetDecks godoc
// @Summary Get all decks for the current user
// @Description Retrieves all decks including personal and system decks
// @Tags deck
// @Accept json
// @Produce json
// @Success 200 {array} supabase.Deck
// @Failure 400 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /deck [get]
func (h *Handler) GetDecks(c *gin.Context) {
	userID := c.GetString("sub")
	
	decks, err := h.db.GetDecks(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch decks"})
		return
	}

	c.JSON(http.StatusOK, decks)
}

// GetDeck godoc
// @Summary Get a specific deck with its flashcards
// @Description Retrieves a deck by ID along with its flashcards
// @Tags deck
// @Accept json
// @Produce json
// @Param id path int true "Deck ID"
// @Success 200 {object} supabase.DeckWithCards
// @Failure 400 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /deck/{id} [get]
func (h *Handler) GetDeck(c *gin.Context) {
	userID := c.GetString("sub")
	log.Printf("Authenticated user ID: %s", userID)
	deckIDStr := c.Param("id")
	log.Printf("Deck ID: %s", deckIDStr)
	
	deckID, err := strconv.Atoi(deckIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deck ID"})
		return
	}

	deck, err := h.db.GetDeckWithCards(deckID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deck not found"})
		return
	}

	c.JSON(http.StatusOK, deck)
}

// CreateDeck godoc
// @Summary Create a new deck
// @Description Creates a new flashcard deck for the current user
// @Tags deck
// @Accept json
// @Produce json
// @Param deck body supabase.DeckCreate true "Deck Info"
// @Success 201 {object} supabase.Deck
// @Failure 400 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /deck/create [post]
func (h *Handler) CreateDeck(c *gin.Context) {
	userID := c.GetString("sub")

	var deckCreate supabase.DeckCreate
	if err := c.ShouldBindJSON(&deckCreate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	deck := supabase.Deck{
		UserID:      userID,
		Name:        deckCreate.Name,
		Description: deckCreate.Description,
		IsPublic:    false, // Default to private
	}

	createdDeck, err := h.db.CreateDeck(deck)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deck"})
		return
	}

	c.JSON(http.StatusCreated, createdDeck)
}

// DeleteDeck godoc
// @Summary Delete a deck
// @Description Deletes a user's deck by ID (system decks cannot be deleted)
// @Tags deck
// @Accept json
// @Produce json
// @Param id path int true "Deck ID"
// @Success 200 {object} gin.H
// @Failure 400 {object} gin.H
// @Failure 403 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /deck/{id}/delete [post]
func (h *Handler) DeleteDeck(c *gin.Context) {
	userID := c.GetString("sub")
	deckIDStr := c.Param("id")
	
	deckID, err := strconv.Atoi(deckIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deck ID"})
		return
	}

	// Check if deck exists and belongs to user
	deck, err := h.db.GetDeck(deckID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deck not found"})
		return
	}

	// Prevent deletion of system decks
	if deck.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"error": "System decks cannot be deleted"})
		return
	}

	if err := h.db.DeleteDeck(deckID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete deck"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deck deleted successfully"})
}
