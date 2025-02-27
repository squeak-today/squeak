package qnahandler

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"

	"story-api/gemini"
	"story-api/models"
	"story-api/storage"
	"story-api/supabase"
)

type QNAHandler struct {
	dbClient *supabase.Client
}

func New(dbClient *supabase.Client) *QNAHandler {
	return &QNAHandler{
		dbClient: dbClient,
	}
}

//	@Summary		Get or generate a question
//	@Description	Get an existing question or generate a new one for the given content
//	@Tags			qna
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.GetQuestionRequest	true	"Question request parameters"
//	@Success		200		{object}	models.GetQuestionResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Failure		404		{object}	models.ErrorResponse
//	@Router			/qna [post]
func (h *QNAHandler) GetQuestion(c *gin.Context) {
	var infoBody models.GetQuestionRequest

	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	if infoBody.ContentType != "News" && infoBody.ContentType != "Story" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Content type must be either 'News' or 'Story'"})
		return
	}

	if _, err := strconv.Atoi(infoBody.ID); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "ID must be a valid number"})
		return
	}

	if infoBody.QuestionType != "vocab" && infoBody.QuestionType != "understanding" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Question type must be either 'vocab' or 'understanding'"})
		return
	}

	questionData, err := h.dbClient.GetContentQuestion(infoBody.ContentType, infoBody.ID, infoBody.QuestionType, infoBody.CEFRLevel)
	if err != nil {
		log.Printf("Failed to retrieve question: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve question"})
		return
	}

	if questionData == nil {
		if infoBody.ContentType == "Story" {
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "No questions found for this story!"})
			return
		}

		// Step 1: Get the record from supabase db
		contentRecord, err := h.dbClient.GetContentByID(infoBody.ContentType, infoBody.ID)
		if err != nil {
			log.Printf("Failed to retrieve content record in DB: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve content"})
			return
		}
		if contentRecord == nil {
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Content not found"})
			return
		}

		// Step 2: Get the content from s3
		contentData, err := storage.PullContent(
			contentRecord["language"].(string),
			contentRecord["cefr_level"].(string),
			contentRecord["topic"].(string),
			infoBody.ContentType,
			contentRecord["date_created"].(string),
		)
		if err != nil {
			log.Printf("Failed to pull content from S3 bucket: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve content data during new question generation"})
			return
		}
		contentString := contentData.Content

		// Step 3: generate the question
		apiKey := os.Getenv("GEMINI_API_KEY")
		geminiClient, err := gemini.NewGeminiClient(apiKey)
		if err != nil {
			log.Printf("Failed to create Gemini client: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to initialize gemini client"})
			return
		}
		defer geminiClient.Client.Close()

		var generatedQuestion string
		var genErr error
		if infoBody.QuestionType == "vocab" {
			generatedQuestion, genErr = geminiClient.CreateVocabQuestion(infoBody.CEFRLevel, contentString)
		} else {
			generatedQuestion, genErr = geminiClient.CreateUnderstandingQuestion(infoBody.CEFRLevel, contentString)
		}
		if genErr != nil {
			log.Printf("Failed to generate question: %v", genErr)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate question"})
			return
		}

		// Step 4: save question to db
		err = h.dbClient.CreateContentQuestion(infoBody.ContentType, infoBody.ID, infoBody.QuestionType, infoBody.CEFRLevel, generatedQuestion)
		if err != nil {
			log.Printf("Failed to save question to database: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to save question to database"})
			return
		}

		c.JSON(http.StatusOK, models.GetQuestionResponse{
			Question: generatedQuestion,
		})
		return
	}

	c.JSON(http.StatusOK, models.GetQuestionResponse{
		Question: questionData["question"].(string),
	})
}

//	@Summary		Evaluate an answer
//	@Description	Evaluate a user's answer to a question
//	@Tags			qna
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.EvaluateAnswerRequest	true	"Answer evaluation request"
//	@Success		200		{object}	models.EvaluateAnswerResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/qna/evaluate [post]
func (h *QNAHandler) EvaluateAnswer(c *gin.Context) {
	var infoBody models.EvaluateAnswerRequest

	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	geminiClient, err := gemini.NewGeminiClient(apiKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to initialize gemini client"})
		return
	}
	defer geminiClient.Client.Close()

	evaluation, err := geminiClient.EvaluateQNA(infoBody.CEFR, infoBody.Content, infoBody.Question, infoBody.Answer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Evaluation with Gemini failed"})
		return
	}

	// take only first 4 characters of evaluation, as its either PASS or FAIL
	evaluationScore := ""
	if len(evaluation) >= 4 {
		evaluationScore = evaluation[:4]
	} else {
		evaluationScore = evaluation
	}

	explanation, err := geminiClient.GenerateQNAExplanation(infoBody.CEFR, infoBody.Content, infoBody.Question, infoBody.Answer, evaluationScore)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Explanation with Gemini failed"})
		return
	}

	c.JSON(http.StatusOK, models.EvaluateAnswerResponse{
		Evaluation:  evaluationScore,
		Explanation: explanation,
	})
}
