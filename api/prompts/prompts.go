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

func CreateUnderstandingQuestionPrompt(cefr string, content string) string {
	var sb strings.Builder

	sb.WriteString("You are an LLM designed to write questions for reading comprehension tests of other languages. ")
	sb.WriteString("You will be a given a news article or story with a CEFR level of " + cefr + ". ")
	sb.WriteString("Based on the content of this article, respond with a question that would sufficiently challenge someone with the proficiency of " + cefr + ". ")
	sb.WriteString("Your question should test them on understanding of the content. ")
	sb.WriteString("\n\nRespond with the question ONLY. Do NOT add any other preamble or comment.")
	sb.WriteString("\n\nContent:\n" + content)

	prompt := sb.String()

	return prompt
}

func CreateVocabQuestionPrompt(cefr string, content string) string {
	var sb strings.Builder

	sb.WriteString("You are an LLM designed to write questions for word memory of other languages. ")
	sb.WriteString("You will be a given a news article or story with a CEFR level of " + cefr + ". ")
	sb.WriteString("Based on the content of this article, respond with a question in the format of 'What does <word> mean?'. The chosen word must sufficiently challenge someone with the proficiency of " + cefr + ". ")
	sb.WriteString("The question MUST be in the exact form 'What does <word> mean?'. The word MUST be a word that is present in the content.")
	sb.WriteString("\n\nRespond with the question ONLY. Do NOT add any other preamble or comment.")
	sb.WriteString("\n\nContent:\n" + content)

	prompt := sb.String()

	return prompt
}

func CreateEvaluateVocabQNAPrompt(cefr string, content string, question string, answer string) string {
	var sb strings.Builder

	sb.WriteString("You are an LLM designed to evaluate answers to questions that test word memory in other languages. ")
	sb.WriteString("You will be given a news article or story, a question asking about the meaning of a word, and a user's translation of the word. The question and content's difficulty is " + cefr + " on the CEFR scale. ")
	sb.WriteString("You must evaluate the user's answer as either PASS or FAIL based on whether or not they provided a sufficient translation of the word. ")
	sb.WriteString("\n\nAnswer with ONLY PASS or FAIL. Do NOT add any other preamble or comment.")

	sb.WriteString("\n\nContent:\n" + content)
	sb.WriteString("\n\nQuestion:\n" + question)
	sb.WriteString("\n\nAnswer:\n" + answer)

	prompt := sb.String()
	return prompt
}