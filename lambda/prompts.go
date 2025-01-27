package main

import (
	"strings"
)

var cefrPrompts = map[string]string{
	"A1": "must use extremely basic, everyday vocabulary and short sentences and must be 60-120 words.",
	"A2": "must use simple vocabulary and clear sentences with some basic connectors. You must aim for 120-160 words.",
	"B1": "must include semi-complex sentences, specific terms, and connectors. Target 200-300 words.",
	"B2": "must include clear sentences with somewhat advanced vocabulary and some complex ideas. Use a variety of connectors to link your points. Target 300-400 words.",
	"C1": "must employ complex vocabulary, some nuanced expressions, and detailed phrasing with 700-1000 words.",
	"C2": "must employ very complex vocabulary, nuanced expressions, detailed phrasing, and very complex ideas. Target 1400-1900 words.",
}


func createStoryPrompt(language string, cefr string, topic string) string {
	var sb strings.Builder
	sb.WriteString("You are an LLM designed to write " + language + " fiction stories. ")
	sb.WriteString("Using the topic of " + topic + ", write a fictional story that matches the writing complexity of " + cefr + " on the CEFR scale.")
	sb.WriteString("Your story " + cefrPrompts[cefr] + " ")
	sb.WriteString("Provide the story without preamble or other comment. Use markdown headers for titles, subtitles, and section titles.\n\n")

	prompt := sb.String()
	return prompt
}

func createNewsArticlePrompt(language string, cefr string, query string, web_results string) string {
	var sb strings.Builder
	sb.WriteString("You are an LLM designed to write " + language + " news articles. ")
	sb.WriteString("Below this, you are given the results of a search query for \"" + query + "\". ")
	sb.WriteString("Using this information, write a news article that matches the writing complexity of " + cefr + " on the CEFR scale. ")
	sb.WriteString("Your article " + cefrPrompts[cefr] + " ")
	sb.WriteString("Your article must include a title styled like a newspaper headline. Use markdown headers for titles, subtitles, and section titles.\n")
	sb.WriteString("Provide the article without preamble or other comment.\n\n")
	sb.WriteString(web_results)

	prompt := sb.String()
	return prompt
}