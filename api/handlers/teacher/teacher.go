package teacher

import (
	"encoding/json"
	"log"
	"net/http"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"
	"strconv"

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
	isTeacher, err := h.DBClient.CheckAccountType(userID, "teacher")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check teacher status"})
		return
	}
	response := models.TeacherStatusResponse{
		Exists: isTeacher,
	}
	c.JSON(http.StatusOK, response)
}

//	@Summary		Get classrooms
//	@Description	Get classrooms
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.GetClassroomListResponse
//	@Failure		403	{object}	models.ErrorResponse
//	@Router			/teacher/classroom [get]
func (h *TeacherHandler) GetClassroomList(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
	if !isTeacher {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "User is not a teacher"})
		return
	}

	teacherID, err := h.DBClient.GetTeacherUUID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get teacher UUID"})
		return
	}
	classroomList, err := h.DBClient.GetClassroomList(teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom list"})
		return
	}
	c.JSON(http.StatusOK, models.GetClassroomListResponse{
		Classrooms: classroomList,
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
	if !isTeacher {
		return
	}

	language := c.Query("language")
	cefr := c.Query("cefr")
	subject := c.Query("subject")
	page := c.Query("page")
	pagesize := c.Query("pagesize")

	whitelistStatus := c.Query("whitelist")
	contentType := c.Query("content_type")

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

	classroom_id, _, err := h.DBClient.GetClassroomByTeacherId(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
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
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Query execution failed"})
		return
	}

	jsonData, err := json.Marshal(results)
	if err != nil {
		log.Printf("Failed to marshal results: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process results"})
		return
	}

	var response models.QueryClassroomContentResponse
	if err := json.Unmarshal(jsonData, &response); err != nil {
		log.Printf("Failed to unmarshal to response type: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to process response"})
		return
	}

	c.JSON(http.StatusOK, response)
}

//	@Summary		Create classroom
//	@Description	Create classroom
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.CreateClassroomRequest	true	"Create classroom request"
//	@Success		200		{object}	models.CreateClassroomResponse
//	@Failure		403		{object}	models.ErrorResponse
//	@Router			/teacher/classroom/create [post]
func (h *TeacherHandler) CreateClassroom(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	isNotStudent := h.CheckNotForbiddenRole(c, userID, "student")
	if !isNotStudent {
		return
	}

	teacherID, err := h.DBClient.GetTeacherUUID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get teacher UUID"})
		return
	}

	var infoBody models.CreateClassroomRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	classroom_id, err := h.DBClient.CreateClassroom(teacherID, infoBody.Name, infoBody.StudentsCount)
	if err != nil {
		log.Printf("Failed to create classroom: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.CreateClassroomResponse{ClassroomID: classroom_id})
}


//	@Summary		Accept content
//	@Description	Accept content
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.AcceptContentRequest	true	"Accept content request"	
//	@Success		200		{object}	models.AcceptContentResponse
//	@Failure		403		{object}	models.ErrorResponse
//	@Router			/teacher/classroom/accept [post]
func (h *TeacherHandler) AcceptContent(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
	if !isTeacher { return } 

	var infoBody models.AcceptContentRequest

	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Verify content type is valid
	if infoBody.ContentType != "Story" && infoBody.ContentType != "News" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid content type"})
		return
	}

	// Get classroom ID for teacher
	classroomID, _, err := h.DBClient.GetClassroomByTeacherId(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
		return
	}

	classroomIDInt, err := strconv.Atoi(classroomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Invalid classroom ID format"})
		return
	}

	err = h.DBClient.AcceptContent(classroomIDInt, infoBody.ContentType, infoBody.ContentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to accept content"})
		return
	}

	c.JSON(http.StatusOK, models.AcceptContentResponse{Message: "Content accepted successfully"})
}

//	@Summary		Accept content
//	@Description	Accept content
//	@Tags			teacher
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.RejectContentRequest	true	"Reject content request"	
//	@Success		200		{object}	models.RejectContentResponse
//	@Failure		403		{object}	models.ErrorResponse
//	@Router			/teacher/classroom/reject [post]
func (h *TeacherHandler) RejectContent(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
	if !isTeacher { return }

	var infoBody models.RejectContentRequest

	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Verify content type is valid
	if infoBody.ContentType != "Story" && infoBody.ContentType != "News" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid content type"})
		return
	}

	// Get classroom ID for teacher
	classroomID, _, err := h.DBClient.GetClassroomByTeacherId(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
		return
	}

	classroomIDInt, err := strconv.Atoi(classroomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Invalid classroom ID format"})
		return
	}

	err = h.DBClient.RejectContent(classroomIDInt, infoBody.ContentType, infoBody.ContentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to reject content"})
		return
	}

	c.JSON(http.StatusOK, models.RejectContentResponse{Message: "Content rejected successfully"})
}