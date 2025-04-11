package plans

import (
	"slices"
)

// Defines constants for usage limits, feature access, by plans.
// Use the constants here to check if a user can use a feature this time.

// FEATURE IDS
const (
	NATURAL_TTS_FEATURE = "natural_tts"
	PREMIUM_STT_FEATURE = "premium_stt"

	BASIC_AUDIOBOOKS_FEATURE = "basic_audiobooks"
	PREMIUM_AUDIOBOOKS_FEATURE = "premium_audiobooks"
)

type AccessLimitByPlan struct {
	Plan map[string]int
}

// WHERE -1 MEANS UNLIMITED
var FEATURE_ACCESS_LIMITS_BY_PLAN = map[string]AccessLimitByPlan{
	NATURAL_TTS_FEATURE: {
		Plan: map[string]int{
			"FREE": 20,
			"BASIC": -1,
			"PREMIUM": -1,
			"CLASSROOM": -1,
		},
	},
	PREMIUM_STT_FEATURE: {
		Plan: map[string]int{
			"FREE": 20,
			"BASIC": -1,
			"PREMIUM": -1,
			"CLASSROOM": -1,
		},
	},
	BASIC_AUDIOBOOKS_FEATURE: {
		Plan: map[string]int{
			"FREE": 0,
			"BASIC": -1,
			"PREMIUM": -1,
			"CLASSROOM": -1,
		},
	},
	PREMIUM_AUDIOBOOKS_FEATURE: {
		Plan: map[string]int{
			"FREE": 5,
			"BASIC": 5,
			"PREMIUM": -1,
			"CLASSROOM": 20,
		},
	},
}

func GetValidFeatureIDs() []string {
	return []string{NATURAL_TTS_FEATURE, PREMIUM_STT_FEATURE, BASIC_AUDIOBOOKS_FEATURE, PREMIUM_AUDIOBOOKS_FEATURE}
}

func IsValidFeatureID(featureID string) bool {
	validIDs := GetValidFeatureIDs()
	return slices.Contains(validIDs, featureID)
}