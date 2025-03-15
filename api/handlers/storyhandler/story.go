package storyhandler


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

type StoryHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *StoryHandler {
	return &StoryHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Get story page content
//	@Description	Get story content by ID
//	@Tags			story
//	@Accept			json
//	@Produce		json
//	@Param			id		query		string	true	"Content ID"
//	@Param			page	query		string	true	"Page"
//	@Success		200		{object}	models.GetStoryPageResponse
//	@Failure		403		{object}	models.ErrorResponse
//	@Failure		404		{object}	models.ErrorResponse
//	@Router			/story [get]
func (h *StoryHandler) GetStoryPage(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	id := c.Query("id")
	page := c.Query("page")

	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "ID parameter is required"})
		return
	}

	pageNum, err := strconv.Atoi(page)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Page parameter incorrect"})
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
	contentRecord, err := h.DBClient.GetContentByID("Story", id)
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
	content, err := storage.PullStoryByPage(
		contentRecord["language"].(string),
		contentRecord["cefr_level"].(string),
		contentRecord["topic"].(string),
		contentRecord["id"].(string),
		pageNum,
	)
	if err != nil {
		log.Printf("Failed to pull story by page: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve content data"})
		return
	}

	response := models.GetStoryPageResponse{
		CEFRLevel:   contentRecord["cefr_level"].(string),
		Content:     content.Content,
		ContentType: "Story",
		DateCreated: contentRecord["date_created"].(string),
		Language:    contentRecord["language"].(string),
		Pages:       contentRecord["pages"].(int),
		PreviewText: contentRecord["preview_text"].(string),
		Title:       contentRecord["title"].(string),
		Topic:       contentRecord["topic"].(string),
	}

	c.JSON(http.StatusOK, response)
}

//	@Summary		Get story QNA context
//	@Description	Get story QNA context by ID
//	@Tags			story
//	@Accept			json
//	@Produce		json
//	@Param			id	query		string	true	"Content ID"
//	@Success		200	{object}	models.GetStoryQNAContextResponse
//	@Failure		404	{object}	models.ErrorResponse
//	@Router			/story/context [get]
func (h *StoryHandler) GetStoryQNAContext(c *gin.Context) {
	id := c.Query("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "ID parameter is required"})
		return
	}

	// Get the record from supabase db
	contentRecord, err := h.DBClient.GetContentByID("Story", id)
	if err != nil {
		log.Printf("Failed to retrieve content record in DB: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve content"})
		return
	}
	if contentRecord == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Content not found"})
		return
	}

	// Get the context from s3
	context, err := storage.PullStoryQNAContext(
		contentRecord["language"].(string),
		contentRecord["cefr_level"].(string),
		contentRecord["topic"].(string),
		contentRecord["id"].(string),
	)
	if err != nil {
		log.Printf("Failed to pull story context: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve context data"})
		return
	}

	response := models.GetStoryQNAContextResponse{
		Context: context,
	}

	c.JSON(http.StatusOK, response)
}

//	@Summary		Get story query
//	@Description	Get story query by ID
//	@Tags			story
//	@Accept			json
//	@Produce		json
//	@Param			language	query		string	true	"Language"
//	@Param			cefr		query		string	true	"CEFR"
//	@Param			subject		query		string	true	"Subject"
//	@Param			page		query		string	true	"Page"
//	@Param			pagesize	query		string	true	"Page Size"
//	@Success		200			{object}	models.GetStoryQueryResponse
//	@Router			/story/query [get]
func (h *StoryHandler) GetStoryQuery(c *gin.Context) {
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
	results, err := h.DBClient.QueryStories(params)
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

	var response models.GetStoryQueryResponse
	if err := json.Unmarshal(jsonData, &response); err != nil {
		log.Printf("Failed to unmarshal to response type: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process response"})
		return
	}

	c.JSON(http.StatusOK, response)
}