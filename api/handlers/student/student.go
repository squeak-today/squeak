package student

import (
	"log"
	"net/http"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"

	"github.com/gin-gonic/gin"
)

type StudentHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *StudentHandler {
	return &StudentHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Check user student status
//	@Description	Check if the user is a student and get their classroom info
//	@Tags			student
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.StudentStatusResponse
//	@Failure		403	{object}	models.ErrorResponse
//	@Router			/student [get]
func (h *StudentHandler) CheckStudentStatus(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	studentID, classroomID, err := h.DBClient.CheckStudentStatus(userID)
	if err != nil {
		log.Printf("Failed to check student status: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check student status"})
		return
	}

	response := models.StudentStatusResponse{
		StudentID:   studentID,
		ClassroomID: classroomID,
	}
	c.JSON(http.StatusOK, response)
}

//	@Summary		Get classroom info
//	@Description	Get classroom info for the student
//	@Tags			student
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.GetStudentClassroomResponse
//	@Failure		403	{object}	models.ErrorResponse
//	@Router			/student/classroom [get]
func (h *StudentHandler) GetClassroomInfo(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isStudent := h.CheckIsCorrectRole(c, userID, "student")
	if !isStudent {
		return
	}

	_, classroomID, err := h.DBClient.CheckStudentStatus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check student status"})
		return
	}

	teacherID, studentsCount, err := h.DBClient.GetClassroomById(classroomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get classroom by ID"})
		return
	}

	c.JSON(http.StatusOK, models.GetStudentClassroomResponse{
		TeacherID:     teacherID,
		StudentsCount: studentsCount,
	})
}

//	@Summary		Join classroom
//	@Description	Join a classroom as a student
//	@Tags			student
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.JoinClassroomRequest	true	"Join classroom request"
//	@Success		200		{object}	models.JoinClassroomResponse
//	@Failure		403		{object}	models.ErrorResponse
//	@Router			/student/classroom/join [post]
func (h *StudentHandler) JoinClassroom(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	isNotTeacher := h.CheckNotForbiddenRole(c, userID, "teacher")
	if !isNotTeacher {
		return
	}

	var infoBody models.JoinClassroomRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	err := h.DBClient.AddStudentToClassroom(infoBody.ClassroomID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to add student to classroom"})
		return
	}

	c.JSON(http.StatusOK, models.JoinClassroomResponse{
		Message: "Student added to classroom successfully",
	})
}
