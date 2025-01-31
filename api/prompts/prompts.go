package prompts

import (
	"strings"
)

func CreateEvaluateQNAPrompt(cefr string, content string, question string, answer string) string {
	var sb strings.Builder
	sb.WriteString("You are an LLM designed to evaluate answers to questions that test reading comprehension in other languages. ")
	sb.WriteString("You will be given a news article or story, an accompanying question, and a user's answer. The question and content's difficulty is " + cefr + " on the CEFR scale. ")
	sb.WriteString("You must evaluate the user's answer as either PASS or FAIL based on whether or not they successfully explained what was asked in the question. ")
	sb.WriteString("\n\nAnswer with ONLY PASS or FAIL. Do NOT add any other preamble or comment.")

	sb.WriteString("\n\nContent:\n" + content)
	sb.WriteString("\n\nQuestion:\n" + question)
	sb.WriteString("\n\nAnswer:\n" + answer)

	prompt := sb.String()
	return prompt
}