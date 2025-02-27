package models

type GetQuestionRequest struct {
	ContentType string `json:"content_type" binding:"required" example:"News"`
	ID          string `json:"id" binding:"required" example:"123"`
	CEFRLevel   string `json:"cefr_level" binding:"required" example:"B1"`
	QuestionType string `json:"question_type" binding:"required" example:"vocab"`
}

type GetQuestionResponse struct {
	Question string `json:"question" binding:"required" example:"What does 'bonjour' mean?"`
}

type EvaluateAnswerRequest struct {
	CEFR     string `json:"cefr" binding:"required" example:"B1"`
	Content  string `json:"content" binding:"required" example:"Bonjour, comment ça va?"`
	Question string `json:"question" binding:"required" example:"What does 'bonjour' mean?"`
	Answer   string `json:"answer" binding:"required" example:"Hello"`
}

type EvaluateAnswerResponse struct {
	Evaluation  string `json:"evaluation" binding:"required" example:"PASS"`
	Explanation string `json:"explanation" binding:"required" example:"Perfect!"`
}
