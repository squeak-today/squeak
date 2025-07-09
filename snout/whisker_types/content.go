package whisker_types

type LanguageCode string

const (
	EnglishCode LanguageCode = "en"
	SpanishCode LanguageCode = "es"
	FrenchCode  LanguageCode = "fr"
)

type Language string

const (
	English Language = "English"
	Spanish Language = "Spanish"
	French  Language = "French"
)

type CEFRLevel string

const (
	A1 CEFRLevel = "A1"
	A2 CEFRLevel = "A2"
	B1 CEFRLevel = "B1"
	B2 CEFRLevel = "B2"
	C1 CEFRLevel = "C1"
	C2 CEFRLevel = "C2"
)

// early type for testing
// change once the llm + scraping step is done
type StoredContent struct {
	Name     string `json:"name"`
	Markdown string `json:"markdown"`
}
