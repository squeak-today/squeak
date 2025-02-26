package teacher

import (
	"log"
	"net/http"
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