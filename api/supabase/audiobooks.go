package supabase

import (
	"fmt"
	"time"
)

type AudiobookInfo struct {
	Language  string
	Topic     string
	CEFRLevel string
	Date      time.Time
	Tier      string
	Pages     int
}

func (c *Client) GetAudiobook(contentType string, id string) (AudiobookInfo, error) {
	var language string
	var topic string
	var cefr_level string
	var date time.Time
	if contentType != "news" && contentType != "story" {
		err := fmt.Errorf("GetAudiobook: Invalid contentType story|news")
		return AudiobookInfo{}, err
	}

	tableName := contentType
	if contentType == "story" { tableName = "stories" }

	err := c.db.QueryRow(fmt.Sprintf("SELECT language, topic, cefr_level, date_created FROM %s WHERE id = $1", tableName),
		id).Scan(&language, &topic, &cefr_level, &date)
	if err != nil {
		return AudiobookInfo{}, err
	}

	var tier *string
	var pages *int
	err = c.db.QueryRow(fmt.Sprintf("SELECT tier, pages FROM audiobooks WHERE %s_id = $1", contentType),
		id).Scan(&tier, &pages)
	if err != nil && err.Error() == "sql: no rows in result set" {
		return AudiobookInfo{Language: language, Topic: topic, CEFRLevel: cefr_level, Date: date, Tier: "", Pages: 0}, nil
	}

	tierStr := ""
	if tier != nil {
		tierStr = *tier
	}
	pagesInt := 0
	if pages != nil {
		pagesInt = *pages
	}

	return AudiobookInfo{Language: language, Topic: topic, CEFRLevel: cefr_level, Date: date, Tier: tierStr, Pages: pagesInt}, nil
}
