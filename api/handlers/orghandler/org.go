package org

import (
	"net/http"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"

	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// to impelement logins to organizations
// MUST BE TEACHER TO CALL
// /organization - provides org id and teacher id for calling user
// /organization/plan -  returns either free, standard, or premium.
// /organization/create - creates organization, making the calling USER the admin
// 						  and setting it to free by default. Automatically adds the calling user as a teacher.
// /organization/join   - joins calling teacher to organization given an id. will error if they
//						  haven't been added as an approved teacher or if the organization is free/standard.
// /organization

type OrganizationHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *OrganizationHandler {
	return &OrganizationHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Check Organization for Teacher
//	@Description	Check Organization for Teacher
//	@Tags			organization
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.OrganizationResponse
//	@Failure		401	{object}	models.ErrorResponse
//	@Failure		404	{object}	models.ErrorResponse
//	@Router			/organization [get]
func (h *OrganizationHandler) CheckOrganization(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher, err := h.DBClient.CheckAccountType(userID, "teacher")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check teacher status"})
		return
	}
	if !isTeacher {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Only teachers can access this!",
		})
		return
	}

	teacherID, err := h.DBClient.GetTeacherUUID(userID)
	if err != nil {
		log.Printf("Failed to get teacher ID: %v", err)
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Failed to get teacher ID"})
		return
	}

	orgID, err := h.DBClient.CheckTeacherOrganization(teacherID)
	if err != nil {
		log.Printf("Failed to get organization ID: %v", err)
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Failed to get organization ID"})
		return
	}

	plan, _, _, expiration, canceled, err := h.DBClient.GetOrganizationInfo(orgID)
	if err != nil {
		log.Printf("Failed to get organization info: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization info"})
		return
	}

	response := models.OrganizationResponse{
		OrganizationID: orgID,
		TeacherID:      teacherID,
		Plan:           plan,
		ExpirationDate: expiration.Format(time.RFC3339),
		Canceled:       canceled,
	}

	c.JSON(http.StatusOK, response)
}

//	@Summary		Create Organization
//	@Description	Create Organization. Automatically adds the calling user as a teacher.
//	@Tags			organization
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.CreateOrganizationRequest	true	"Create organization request"
//	@Success		200		{object}	models.CreateOrganizationResponse
//	@Failure		401		{object}	models.ErrorResponse
//	@Router			/organization/create [post]
func (h *OrganizationHandler) CreateOrganization(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isNotStudent := h.CheckNotForbiddenRole(c, userID, "student")
	if !isNotStudent {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Only non-students can create organizations!"})
		return
	}

	organizationID, _ := h.DBClient.CheckTeacherOrganizationByUserID(userID)
	if organizationID != "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Teacher already in organization"})
		return
	}

	organizationID, err := h.DBClient.CreateOrganization(userID)
	if err != nil {
		log.Printf("Failed to create organization: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create organization"})
		return
	}

	teacherID, err := h.DBClient.JoinOrganization(userID, organizationID)
	if err != nil {
		log.Printf("Failed to join organization: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to join organization"})
		return
	}

	c.JSON(http.StatusOK, models.CreateOrganizationResponse{
		OrganizationID: organizationID,
		TeacherID:      teacherID,
	})
}

//	@Summary		Join Organization
//	@Description	Join Organization that has been created by another admin.
//	@Tags			organization
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.JoinOrganizationRequest	true	"Join organization request"
//	@Success		200		{object}	models.JoinOrganizationResponse
//	@Failure		401		{object}	models.ErrorResponse
//	@Router			/organization/join [post]
func (h *OrganizationHandler) JoinOrganization(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isTeacher, err := h.DBClient.CheckAccountType(userID, "teacher")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check teacher status"})
		return
	}
	if !isTeacher {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Only teachers can join organizations!",
		})
		return
	}
	organizationID, _ := h.DBClient.CheckTeacherOrganizationByUserID(userID)
	if organizationID != "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Teacher already in organization"})
		return
	}
	
	var infoBody models.JoinOrganizationRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	plan, err := h.DBClient.GetOrganizationPlan(infoBody.OrganizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization plan"})
		return
	}
	if plan == "FREE" || plan == "CLASSROOM" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Free or Classroom organizations can only have one member!"})
		return
	}

	teacherID, err := h.DBClient.JoinOrganization(userID, infoBody.OrganizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to join organization"})
		return
	}

	c.JSON(http.StatusOK, models.JoinOrganizationResponse{
		TeacherID: teacherID,
	})
}
