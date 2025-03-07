package newshandler

import (
	"encoding/json"
	"log"
	"net/http"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"
	"story-api/storage"
	"strconv"
	"github.com/gin-gonic/gin"
)

type NewsHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *NewsHandler {
	return &NewsHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Get news content
//	@Description	Get news content by ID
//	@Tags			news
//	@Accept			json
//	@Produce		json
//	@Param			id	query		string	true	"Content ID"
//	@Success		200	{object}	models.GetNewsResponse
//	@Failure		400	{object}	models.ErrorResponse
//	@Failure		404	{object}	models.ErrorResponse
//	@Failure		500	{object}	models.ErrorResponse
//	@Router			/news [get]
func (h *NewsHandler) GetNews(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	id := c.Query("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "ID parameter is required"})
		return
	}

	_, classroomID, err := h.DBClient.CheckStudentStatus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check student status"})
		return
	}
	if classroomID != "" {
		accepted, err := h.DBClient.CheckAcceptedContent(classroomID, "News", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check accepted content"})
			return
		}
		if !accepted {
			c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Content not accepted in classroom"})
			return
		}
	}

	// Get the record from supabase db
	contentRecord, err := h.DBClient.GetContentByID("News", id)
	if err != nil {
		log.Printf("Failed to retrieve content record in DB: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve content"})
		return
	}
	if contentRecord == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Content not found"})
		return
	}

	// Get the content from s3
	content, err := storage.PullContent(
		contentRecord["language"].(string),
		contentRecord["cefr_level"].(string),
		contentRecord["topic"].(string),
		"News",
		contentRecord["date_created"].(string),
	)
	if err != nil {
		log.Printf("Failed to pull content from S3 bucket: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve content data"})
		return
	}

	response := models.GetNewsResponse{
		ContentType: "News",
		Language:    contentRecord["language"].(string),
		CEFRLevel:   contentRecord["cefr_level"].(string),
		Topic:       contentRecord["topic"].(string),
		DateCreated: contentRecord["date_created"].(string),
		Title:       contentRecord["title"].(string),
		PreviewText: contentRecord["preview_text"].(string),
		Content:     content.Content,
		Dictionary:  content.Dictionary,
		Sources:     content.Sources,
	}

	c.JSON(http.StatusOK, response)
}

//	@Summary		Get news content
//	@Description	Get news content by ID
//	@Tags			news
//	@Accept			json
//	@Produce		json
//	@Param			language	query		string	true	"Language"
//	@Param			cefr		query		string	true	"CEFR"
//	@Param			subject		query		string	true	"Subject"
//	@Param			page		query		string	true	"Page"
//	@Param			pagesize	query		string	true	"Page size"
//	@Success		200			{object}	models.GetNewsQueryResponse
//	@Router			/news/query [get]
func (h *NewsHandler) GetNewsQuery(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	language := c.Query("language")
	cefr := c.Query("cefr")
	subject := c.Query("subject")
	page := c.Query("page")
	pagesize := c.Query("pagesize")

	if page == "" {
		page = "1"
	}
	if pagesize == "" {
		pagesize = "10"
	}

	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid page number"})
		return
	}

	pageSizeNum, err := strconv.Atoi(pagesize)
	if err != nil || pageSizeNum < 1 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid page size"})
		return
	}

	params := supabase.QueryParams{
		Language: language,
		CEFR:     cefr,
		Subject:  subject,
		Page:     pageNum,
		PageSize: pageSizeNum,
	}

	_, classroomID, err := h.DBClient.CheckStudentStatus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check student status"})
		return
	}

	if classroomID != "" {
		params.ClassroomID = classroomID
		params.WhitelistStatus = "accepted"
	}

	results, err := h.DBClient.QueryNews(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Query execution failed"})
		return
	}

	jsonData, err := json.Marshal(results)
	if err != nil {
		log.Printf("Failed to marshal results: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process results"})
		return
	}

	var response models.GetNewsQueryResponse
	if err := json.Unmarshal(jsonData, &response); err != nil {
		log.Printf("Failed to unmarshal to response type: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process response"})
		return
	}

	c.JSON(http.StatusOK, response)
}