package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/chromedp/chromedp"
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

// ScraperOptions contains configuration options for the scraper
type ScraperOptions struct {
	Headless  bool
	Timeout   time.Duration
	UserAgent string
	Viewport  struct {
		Width  int
		Height int
	}
}

// ContentScraper handles web content scraping
type ContentScraper struct {
	options *ScraperOptions
}

// NewContentScraper creates a new ContentScraper with the given options
func NewContentScraper(options *ScraperOptions) *ContentScraper {
	if options == nil {
		options = &ScraperOptions{
			Headless:  true,
			Timeout:   30 * time.Second,
			UserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			Viewport: struct {
				Width  int
				Height int
			}{
				Width:  1920,
				Height: 1080,
			},
		}
	}
	return &ContentScraper{options: options}
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

// ScrapeContent scrapes content from a single URL
func (s *ContentScraper) ScrapeContent(targetURL string) ScrapedContent {
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
	ctx, cancel = context.WithTimeout(ctx, s.options.Timeout)
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

// ScrapeMultipleUrls scrapes content from multiple URLs
func (s *ContentScraper) ScrapeMultipleUrls(urls []string) []ScrapedContent {
	results := make([]ScrapedContent, len(urls))
	for i, url := range urls {
		results[i] = s.ScrapeContent(url)
	}
	return results
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go <URL>")
		os.Exit(1)
	}

	targetURL := os.Args[1]
	scraper := NewContentScraper(nil)
	
	fmt.Printf("Scraping: %s\n", targetURL)
	
	result := scraper.ScrapeContent(targetURL)
	
	// Output as JSON
	jsonData, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	
	fmt.Println(string(jsonData))
} 