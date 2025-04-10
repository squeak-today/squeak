// supabase/stats.go
package supabase

import (
	"time"
)

type StudyStats struct {
	ID              int       `json:"id"`
	UserID          string    `json:"user_id"`
	DeckID          int       `json:"deck_id"`
	DeckName        string    `json:"deck_name"`
	CardsStudied    int       `json:"cards_studied"`
	CardsMastered   int       `json:"cards_mastered"`
	LastStudyDate   time.Time `json:"last_study_date"`
	StudyStreakDays int       `json:"study_streak_days"`
}

type StudySession struct {
	UserID        string    `json:"user_id"`
	DeckID        int       `json:"deck_id" binding:"required"`
	CardsStudied  int       `json:"cards_studied" binding:"required"`
	CardsMastered int       `json:"cards_mastered"`
	StudyDate     time.Time `json:"study_date"`
}

// GetUserStudyStats retrieves study statistics for all decks
func (c *Client) GetUserStudyStats(userID string) ([]StudyStats, error) {
	var stats []StudyStats

	query := `
		SELECT ss.*, d.name as deck_name
		FROM study_stats ss
		JOIN decks d ON ss.deck_id = d.id
		WHERE ss.user_id = $1
		ORDER BY ss.last_study_date DESC
	`

	rows, err := c.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var stat StudyStats
		if err := rows.Scan(&stat.ID, &stat.UserID, &stat.DeckID, &stat.DeckName, &stat.CardsStudied, &stat.CardsMastered, &stat.LastStudyDate, &stat.StudyStreakDays); err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}

// RecordStudySession records a study session
func (c *Client) RecordStudySession(session StudySession) error {
	// If no study date provided, use current time
	if session.StudyDate.IsZero() {
		session.StudyDate = time.Now()
	}

	// First check if a record exists
	var count int
	err := c.db.QueryRow(`
		SELECT COUNT(*) FROM study_stats 
		WHERE user_id = $1 AND deck_id = $2
	`, session.UserID, session.DeckID).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		// Update existing stats
		query := `
			UPDATE study_stats
			SET 
				cards_studied = cards_studied + $1,
				cards_mastered = cards_mastered + $2,
				last_study_date = $3,
				study_streak_days = CASE 
					WHEN DATE(last_study_date) = DATE(NOW() - INTERVAL '1 day') THEN study_streak_days + 1
					WHEN DATE(last_study_date) = DATE(NOW()) THEN study_streak_days
					ELSE 1
				END
			WHERE user_id = $4 AND deck_id = $5
		`

		_, err := c.db.Exec(query, session.CardsStudied, session.CardsMastered, session.StudyDate, session.UserID, session.DeckID)
		if err != nil {
			return err
		}
	} else {
		// Create new record
		query := `
			INSERT INTO study_stats
			(user_id, deck_id, cards_studied, cards_mastered, last_study_date, study_streak_days)
			VALUES ($1, $2, $3, $4, $5, 1)
		`

		_, err := c.db.Exec(query, session.UserID, session.DeckID, session.CardsStudied, session.CardsMastered, session.StudyDate)
		if err != nil {
			return err
		}
	}

	return nil
}
