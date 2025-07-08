package scraperhandler

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/chromedp/chromedp"
	"github.com/gin-gonic/gin"
	"story-api/supabase"
)

// ScrapedContent represents the scraped content from a URL
type ScrapedContent struct {
	URL     string `json:"url"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Excerpt string `json:"excerpt"`
	Length  int    `json:"length"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// ScraperRequest represents the request to scrape a URL
type ScraperRequest struct {
	URL string `json:"url" binding:"required"`
}

// Handler handles scraper-related requests
type Handler struct {
	db *supabase.Client
}

// New creates a new scraper handler
func New(db *supabase.Client) *Handler {
	return &Handler{db: db}
}

// cleanArticleHTML removes unwanted HTML tags and keeps only content
func cleanArticleHTML(html string) string {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return html
	}

	// Remove unwanted tags
	doc.Find("script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar, .navigation, .menu, .footer, .header").Remove()
	
	// Remove all tags except content tags
	doc.Find("*").Each(func(i int, s *goquery.Selection) {
		tagName := goquery.NodeName(s)
		if tagName != "p" && tagName != "h1" && tagName != "h2" && tagName != "h3" && tagName != "h4" && tagName != "h5" && tagName != "h6" && tagName != "img" && tagName != "div" && tagName != "article" && tagName != "section" {
			s.Remove()
		}
	})

	// Remove empty elements
	doc.Find("p, h1, h2, h3, h4, h5, h6, div, article, section").Each(func(i int, s *goquery.Selection) {
		if strings.TrimSpace(s.Text()) == "" {
			s.Remove()
		}
	})

	// Extract text content
	text := doc.Text()
	text = strings.TrimSpace(text)
	
	// Clean up whitespace
	text = strings.ReplaceAll(text, "\n\n\n", "\n\n")
	text = strings.ReplaceAll(text, "\n\n\n", "\n\n")
	
	return text
}

// scrapeContent scrapes content from a single URL
func scrapeContent(targetURL string) ScrapedContent {
	result := ScrapedContent{
		URL:     targetURL,
		Success: false,
	}

	// Validate URL
	_, err := url.Parse(targetURL)
	if err != nil {
		result.Error = fmt.Sprintf("Invalid URL: %v", err)
		return result
	}

	// Create Chrome context
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	// Set timeout
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var html string
	err = chromedp.Run(ctx,
		chromedp.Navigate(targetURL),
		chromedp.WaitReady("body"),
		chromedp.OuterHTML("html", &html),
	)

	if err != nil {
		result.Error = fmt.Sprintf("Failed to load page: %v", err)
		return result
	}

	// Parse HTML with goquery
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		result.Error = fmt.Sprintf("Failed to parse HTML: %v", err)
		return result
	}

	// Extract title
	result.Title = strings.TrimSpace(doc.Find("title").Text())
	if result.Title == "" {
		result.Title = strings.TrimSpace(doc.Find("h1").First().Text())
	}

	// Extract content using a simple approach
	content := ""
	
	// Try to find main content area
	mainContent := doc.Find("main, article, .content, .post-content, .entry-content, .article-content")
	if mainContent.Length() > 0 {
		html, _ := mainContent.Html()
		content = cleanArticleHTML(html)
	} else {
		// Fallback to body content
		body := doc.Find("body")
		html, _ := body.Html()
		content = cleanArticleHTML(html)
	}

	// If content is still empty, try paragraphs
	if strings.TrimSpace(content) == "" {
		paragraphs := doc.Find("p").Map(func(i int, s *goquery.Selection) string {
			return strings.TrimSpace(s.Text())
		})
		content = strings.Join(paragraphs, "\n\n")
	}

	result.Content = strings.TrimSpace(content)
	result.Length = len(result.Content)
	result.Success = result.Length > 0

	// Create excerpt from first few sentences
	if result.Success {
		sentences := strings.Split(result.Content, ". ")
		if len(sentences) > 0 {
			result.Excerpt = strings.TrimSpace(sentences[0])
			if len(result.Excerpt) > 200 {
				result.Excerpt = result.Excerpt[:200] + "..."
			}
		}
	}

	return result
}

// ScrapeURL scrapes content from a URL
func (h *Handler) ScrapeURL(c *gin.Context) {
	var req ScraperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate URL format
	if req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}

	// Scrape the content
	result := scrapeContent(req.URL)

	if !result.Success {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error,
			"url":   req.URL,
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ScrapeMultipleURLs scrapes content from multiple URLs
func (h *Handler) ScrapeMultipleURLs(c *gin.Context) {
	var req struct {
		URLs []string `json:"urls" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if len(req.URLs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one URL is required"})
		return
	}

	// Limit the number of URLs to prevent abuse
	if len(req.URLs) > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 10 URLs allowed per request"})
		return
	}

	results := make([]ScrapedContent, len(req.URLs))
	for i, url := range req.URLs {
		results[i] = scrapeContent(url)
	}

	c.JSON(http.StatusOK, gin.H{
		"results": results,
		"count":   len(results),
	})
}

// HealthCheck checks if the scraper is working
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "scraper",
	})
} 