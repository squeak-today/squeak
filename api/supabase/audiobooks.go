package supabase

import (
	"time"
)

type AudiobookInfo struct {
	Language  string
	Topic     string
	CEFRLevel string
	Date      time.Time
	Tier      string
}

func (c *Client) GetAudiobook(newsID int) (AudiobookInfo, error) {
	var language string
	var topic string
	var cefr_level string
	var date time.Time
	err := c.db.QueryRow(`
		SELECT language, topic, cefr_level, date_created FROM news WHERE id = $1`,
		newsID).Scan(&language, &topic, &cefr_level, &date)
	if err != nil {
		return AudiobookInfo{}, err
	}

	var tier *string
	err = c.db.QueryRow(`
		SELECT tier FROM audiobooks WHERE news_id = $1`,
		newsID).Scan(&tier)
	if err != nil && err.Error() == "sql: no rows in result set" {
		return AudiobookInfo{Language: language, Topic: topic, CEFRLevel: cefr_level, Date: date, Tier: ""}, nil
	}

	tierStr := ""
	if tier != nil {
		tierStr = *tier
	}

	return AudiobookInfo{Language: language, Topic: topic, CEFRLevel: cefr_level, Date: date, Tier: tierStr}, nil
}
