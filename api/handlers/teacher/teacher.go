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
	if !isTeacher {
		return
	}

	classroom_id, students_count, err := h.DBClient.GetClassroomByTeacherId(userID)
	if err != nil {
		log.Printf("Failed to get classroom: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
		return
	}
	c.JSON(http.StatusOK, models.GetClassroomInfoResponse{
		ClassroomID:   classroom_id,
		StudentsCount: students_count,
	})
}

// @Summary      Get student profiles for a teacher’s classroom
// @Description  Retrieves a list of student profiles for the classroom associated with the teacher
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Success      200  {object}  models.GetStudentProfilesResponse  "Successful response"
// @Failure      500  {object}  models.ErrorResponse             "Internal error"
// @Router       /teacher/classroom/profiles [get]
func (h *TeacherHandler) GetStudentProfiles(c *gin.Context) {
    userID := h.GetUserIDFromToken(c)
    isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
    if !isTeacher { 
        return 
    }

    // Get classroom ID for the teacher
    classroomID, _, err := h.DBClient.GetClassroomByTeacherId(userID)
    if err != nil {
        log.Printf("Failed to get classroom: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get classroom"})
        return
    }

    classroomIDInt, err := strconv.Atoi(classroomID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid classroom ID format"})
        return
    }

    // Get all student user IDs in the classroom
    studentUserIDs, err := h.DBClient.GetStudentUserIDsByClassroom(classroomIDInt)
    if err != nil {
        log.Printf("Failed to get student IDs: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student IDs"})
        return
    }

    // Get profiles for all students
    profiles, err := h.DBClient.GetProfilesByUserIDs(studentUserIDs)
    if err != nil {
        log.Printf("Failed to get student profiles: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student profiles"})
        return
    }

	// Convert []*supabase.Profile to []models.GetProfileResponse
	convertedProfiles := make([]models.GetProfileResponse, len(profiles))
	for i, p := range profiles {
		convertedProfiles[i] = models.GetProfileResponse{
			UserID:             p.UserID,
			Username:           p.Username,
			LearningLanguage:   p.LearningLanguage,
			SkillLevel:         p.SkillLevel,
			InterestedTopics:   p.InterestedTopics,
			DailyQuestionsGoal: p.DailyQuestionsGoal,
		}
	}

    c.JSON(http.StatusOK, models.GetStudentProfilesResponse{
        Count:    len(profiles),
        Profiles: convertedProfiles,
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

	var infoBody models.CreateClassroomRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	classroom_id, err := h.DBClient.CreateClassroom(userID, infoBody.StudentsCount)
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

// Add to teacher.go handler
// @Summary      Remove student from classroom
// @Description  Allows teachers to remove a student from their classroom
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Param        request  body  models.RemoveStudentRequest  true  "Student removal request"
// @Success      200  {object}  models.RemoveStudentResponse
// @Router       /teacher/classroom/remove-student [post]
func (h *TeacherHandler) RemoveStudent(c *gin.Context) {
    userID := h.GetUserIDFromToken(c)
    isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
    if !isTeacher {
        return
    }

    var req models.RemoveStudentRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
        return
    }

    // Get teacher's classroom
    classroomID, _, err := h.DBClient.GetClassroomByTeacherId(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
        return
    }

    // Convert classroom ID to int
    classroomIDInt, err := strconv.Atoi(classroomID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Invalid classroom format"})
        return
    }

    // Remove student
    if err := h.DBClient.RemoveStudentFromClassroom(classroomIDInt, req.StudentID); err != nil {
        log.Printf("Failed to remove student: %v", err)
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to remove student"})
        return
    }

    c.JSON(http.StatusOK, models.RemoveStudentResponse{
        Message: "Student removed successfully",
    })
}

// @Summary      Get classroom problem areas
// @Description  Retrieves the top questions with the highest incorrect rates for the classroom
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Success      200  {object}  models.GetProblemAreasResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /teacher/analytics/problem-areas [get]
func (h *TeacherHandler) GetProblemAreas(c *gin.Context) {
    userID := h.GetUserIDFromToken(c)
    isTeacher := h.CheckIsCorrectRole(c, userID, "teacher")
    if !isTeacher {
        return
    }

    // Get classroom ID for the teacher
    classroomID, _, err := h.DBClient.GetClassroomByTeacherId(userID)
    if err != nil {
        log.Printf("Failed to get classroom: %v", err)
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom"})
        return
    }

    classroomIDInt, err := strconv.Atoi(classroomID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Invalid classroom ID format"})
        return
    }

    // Get student user IDs in the classroom
    studentUserIDs, err := h.DBClient.GetStudentUserIDsByClassroom(classroomIDInt)
    if err != nil {
        log.Printf("Failed to get student IDs: %v", err)
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get student IDs"})
        return
    }

    // Get problem areas
    problemAreas, err := h.DBClient.GetClassroomProblemAreas(studentUserIDs)
    if err != nil {
        log.Printf("Failed to get problem areas: %v", err)
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get problem areas"})
        return
    }

    c.JSON(http.StatusOK, models.GetProblemAreasResponse{
        ProblemAreas: problemAreas,
    })
}