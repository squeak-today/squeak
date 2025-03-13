package models

type GetProfileResponse struct {
    UserID             string   `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
    Username           string   `json:"username" binding:"required" example:"connortbot"`
    LearningLanguage   string   `json:"learning_language" binding:"required" example:"French"`
    SkillLevel         string   `json:"skill_level" binding:"required" example:"B1"`
    InterestedTopics   []string `json:"interested_topics" binding:"required" example:"[\"NBA\"]"`
    DailyQuestionsGoal int     `json:"daily_questions_goal" binding:"gte=0" example:"3"`
}

type UpsertProfileRequest struct {
	Username           string   `json:"username" binding:"required" example:"johndoe"`
	LearningLanguage   string   `json:"learning_language" binding:"required" example:"French"`
	SkillLevel         string   `json:"skill_level" binding:"required" example:"B1"`
	InterestedTopics   []string `json:"interested_topics" binding:"required" example:"[\"NBA\"]"`
	DailyQuestionsGoal int     `json:"daily_questions_goal" binding:"gte=0" example:"3"`
}

type UpsertProfileResponse struct {
	Message string `json:"message" binding:"required" example:"Profile updated successfully"`
	ID      int    `json:"id" binding:"gte=0" example:"123"`
}
