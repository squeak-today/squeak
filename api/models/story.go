package models

type GetStoryPageResponse struct {
	CEFRLevel string `json:"cefr_level" binding:"required" example:"B1"`
	Content string `json:"content" binding:"required" example:"Le contenu complet de l'article..."`
	ContentType string `json:"content_type" binding:"required" example:"Story"`
	DateCreated string `json:"date_created" binding:"required" example:"2024-02-26"`
	Language string `json:"language" binding:"required" example:"French"`
	Pages int `json:"pages" binding:"required" example:"10"`
	PreviewText string `json:"preview_text" binding:"required" example:"Un résumé des nouvelles musicales..."`
	Title string `json:"title" binding:"required" example:"L'actualité musicale en bref"`
	Topic string `json:"topic" binding:"required" example:"Music"`
}

type GetStoryQNAContextResponse struct {
	Context string `json:"context" binding:"required" example:"Le contexte de l'histoire..."`
}

type StoryItem struct {
	CEFRLevel string `json:"cefr_level" binding:"required" example:"B1"`
	CreatedAt string `json:"created_at" binding:"required" example:"2024-02-26T13:01:13.390612Z"`
	DateCreated string `json:"date_created" binding:"required" example:"2024-02-26"`
	ID string `json:"id" binding:"required" example:"123"`
	Language string `json:"language" binding:"required" example:"French"`
	PreviewText string `json:"preview_text" binding:"required" example:"Un résumé des nouvelles musicales..."`
	Title string `json:"title" binding:"required" example:"L'actualité musicale en bref"`
	Topic string `json:"topic" binding:"required" example:"Music"`
}

type GetStoryQueryResponse []StoryItem