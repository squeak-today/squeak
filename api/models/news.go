package models

import "story-api/storage"

type GetNewsResponse struct {
	ContentType string 	            `json:"content_type" binding:"required" example:"News"`
	Language    string              `json:"language" binding:"required" example:"French"`
	CEFRLevel   string              `json:"cefr_level" binding:"required" example:"B1"`
	Topic       string              `json:"topic" binding:"required" example:"Music"`
	DateCreated string              `json:"date_created" binding:"required" example:"2024-02-26"`
	Title       string              `json:"title" binding:"required" example:"L'actualité musicale en bref"`
	PreviewText string              `json:"preview_text" binding:"required" example:"Un résumé des nouvelles musicales..."`
	Content     string              `json:"content" binding:"required" example:"Le contenu complet de l'article..."`
	Dictionary  storage.Dictionary  `json:"dictionary" binding:"required"`
	Sources     []storage.Source    `json:"sources" binding:"required"`
}

type NewsItem struct {
	CEFRLevel string `json:"cefr_level" binding:"required" example:"B1"`
	CreatedAt string `json:"created_at" binding:"required" example:"2024-02-26T13:01:13.390612Z"`
	DateCreated string `json:"date_created" binding:"required" example:"2024-02-26"`
	ID string `json:"id" binding:"required" example:"123"`
	Language string `json:"language" binding:"required" example:"French"`
	PreviewText string `json:"preview_text" binding:"required" example:"Un résumé des nouvelles musicales..."`
	Title string `json:"title" binding:"required" example:"L'actualité musicale en bref"`
	Topic string `json:"topic" binding:"required" example:"Music"`
}

type GetNewsQueryResponse []NewsItem