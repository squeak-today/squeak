package models

import "time"

type TodayProgressResponse struct {
	UserID             string    `json:"user_id" binding:"required" example:"123"`
	Date               time.Time `json:"date" binding:"required" example:"2025-02-26T00:00:00Z"`
	QuestionsCompleted int       `json:"questions_completed" binding:"required" example:"5"`
	GoalMet            bool      `json:"goal_met" binding:"required" example:"true"`
}

type StreakResponse struct {
	Streak         int  `json:"streak" binding:"required" example:"7"`
	CompletedToday bool `json:"completed_today" binding:"required" example:"true"`
}

type IncrementProgressResponse struct {
	UserID             string `json:"user_id" binding:"required" example:"123"`
	Date               time.Time `json:"date" binding:"required" example:"2025-02-26T00:00:00Z"`
	QuestionsCompleted int    `json:"questions_completed" binding:"required" example:"5"`
	GoalMet            bool   `json:"goal_met" binding:"required" example:"true"`
}
