package teacher

import (
	"log"
	"net/http"
	"strconv"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"

	"github.com/gin-gonic/gin"
)

type TeacherHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *TeacherHandler {
	return &TeacherHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Check user teacher status
//	@Description	Check if the user is a teacher
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.TeacherStatusResponse
//	@Failure		403	{object}	models.ErrorResponse
//	@Router			/teacher [get]
func (h *TeacherHandler) CheckTeacherStatus(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
	if !isTeacher {
		return
	}
	response := models.TeacherStatusResponse{
		Exists: isTeacher,
	}
	c.JSON(http.StatusOK, response)
}

//	@Summary		Get classroom info
//	@Description	Get classroom info
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.GetClassroomInfoResponse
//	@Failure		403	{object}	models.ErrorResponse
//	@Router			/teacher/classroom [get]
func (h *TeacherHandler) GetClassroomInfo(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
	if !isTeacher { return }
	
	classroom_id, students_count, err := h.DBClient.GetClassroomByTeacherId(userID)
	if err != nil {
		log.Printf("Failed to get classroom: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
		return
	}
	c.JSON(http.StatusOK, models.GetClassroomInfoResponse{
		ClassroomID: classroom_id,
		StudentsCount: students_count,
	})
}

//	@Summary		Query classroom content
//	@Description	Query classroom content
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Param			language		query		string	true	"Language"
//	@Param			cefr			query		string	true	"CEFR"
//	@Param			subject			query		string	true	"Subject"
//	@Param			page			query		string	true	"Page"
//	@Param			pagesize		query		string	true	"Page size"
//	@Param			whitelist		query		string	true	"Whitelist status"
//	@Param			content_type	query		string	true	"Content type"
//	@Success		200				{object}	models.QueryClassroomContentResponse
//	@Failure		403				{object}	models.ErrorResponse
//	@Router			/teacher/classroom/content [get]
func (h *TeacherHandler) QueryClassroomContent(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	
	isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
	if !isTeacher { return }

	language := c.Query("language")
	cefr := c.Query("cefr")
	subject := c.Query("subject")
	page := c.Query("page")
	pagesize := c.Query("pagesize")

	whitelistStatus := c.Query("whitelist")
	contentType := c.Query("content_type")

	if page == "" { page = "1" }
	if pagesize == "" { pagesize = "10" }

	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page number"})
		return
	}

	pageSizeNum, err := strconv.Atoi(pagesize)
	if err != nil || pageSizeNum < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page size"})
		return
	}

	classroom_id, _, err := h.DBClient.GetClassroomByTeacherId(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get classroom"})
		return
	}

	params := supabase.QueryParams{
		Language: language,
		CEFR:     cefr,
		Subject:  subject,
		Page:     pageNum,
		PageSize: pageSizeNum,
		ClassroomID: classroom_id,
		WhitelistStatus: whitelistStatus,
	}

	var results []map[string]interface{}
	if contentType == "All" {
		results, err = h.DBClient.QueryAllContent(params)
	} else if contentType == "Story" {
		results, err = h.DBClient.QueryStories(params)
	} else {
		results, err = h.DBClient.QueryNews(params)
	}

	if err != nil {
		log.Printf("Failed to query content: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed"})
		return
	}

	c.JSON(http.StatusOK, results)
}