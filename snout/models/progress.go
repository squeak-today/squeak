package models

import "time"

type TodayProgressResponse struct {
	UserID             string    `json:"user_id" binding:"required" example:"123"`
	Date               time.Time `json:"date" binding:"required" example:"2025-02-26T00:00:00Z"`
	QuestionsCompleted int       `json:"questions_completed" binding:"gte=0" example:"5"`
	GoalMet            bool      `json:"goal_met" binding:"required" example:"true"`
}

type StreakResponse struct {
	Streak         int   `json:"streak" binding:"gte=0" example:"7"`
	CompletedToday bool  `json:"completed_today" binding:"required" example:"true"`
}

type IncrementProgressResponse struct {
	UserID             string `json:"user_id" binding:"required" example:"123"`
	Date               time.Time `json:"date" binding:"required" example:"2025-02-26T00:00:00Z"`
	QuestionsCompleted int    `json:"questions_completed" binding:"gte=0" example:"5"`
	GoalMet            bool   `json:"goal_met" binding:"required" example:"true"`
}
