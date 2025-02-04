# Squeak: Language Learning By Reading What You Love 🐭

## 🌍📚 What is Squeak?
**Squeak** is a language learning platform with any story or news article you want to read, and written at your level.

It's been shown that language learning is most effective when you understand ~80% of the words in a text. Unlike Duolingo, Babbel, or other language learning apps, Squeak is built to provide content that you will *enjoy* and *understand*.

Squeak content is:
- **Tailored**: Pick a specific difficulty level ([CEFR](https://danteinlinea.com/blog/en/the-cefr-levels/)) for YOUR proficiency. No need to read frustratingly simple stories or things with way too many big words. Learn at a healthy pace.
- **Fascinating**: Read fiction, today's news, or even a fascinating recounting of the 2016 NBA Finals...
- **Easy**: Click a word and get its translation *instantly*, along with the sentence around it. No need for a book on the left, dictionary on the right.
- **Native**: Read stories based on a model fine-tuned on content written by native, professional writers.

See our [roadmap here](https://github.com/orgs/squeak-today/projects/2/views/1).

# Squeak Story Generation and REST API Backend

## Developer Setup

### `/supabase` (semi-optional)
Contains migrations and code to interact with Supabase via code if needed.
Needs a `.env` file with the following format:
```shell
SUPABASE_HOST = "..."
SUPABASE_PORT = "..."
SUPABASE_USER = "..."
SUPABASE_PASSWORD = "..."
SUPABASE_DATABASE = "..."
```

This folder is semi-optional as its not needed to test in development, but migrations are still recorded in the repo.

### Deploy API
These instructions are for deployment using Squeak's official domain and already existing Supabase.
If you are viewing this as an open source user, some of these may not apply. You will need to create your own Supabase instance and, if desired, a domain for the API.

1. Build Go binaries with `./build-for-lambda.sh` in all lambda directories which compiles, zips, and places in `infrastructure/`.

2. See `infrastructure/WORKSPACES.md` for instructions on how to deploy/update the infrastructure.

4. The `queue_filler` lambda will be invoked automatically at regular intervals, but you may invoke it early for testing story generation-tied features.

5. **IMPORTANT**: All API endpoints need to be called with a `Authorization: Bearer <JWT Token>` header.

## Backend API
| Endpoint | Type | Description | 
| --- | --- | --- |
| `/content` | `GET` | Pull generated content data. |
| `/story` | `GET` | Pull a generated story. |
| `/news` | `GET` | Pull a generated news article. |
| `/translate` | `POST` | Translation of given sentence to source language. |
| `/evaluate-qna` | `POST` | Evaluation of a user's answer to a question about a given content. |
| `/news-query` | `GET` | Query Supabase for news articles. |
| `/story-query` | `GET` | Query Supabase for stories. |
| `/content-question` | `POST` | Generate a question testing vocabulary or understanding of a given piece of content. |

### **GET** `/content`
> https://api.squeak.today/content

Pulls generated content data as JSON. Pass `type` and `id` as fields.
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `string` | Yes | Type of content, either `Story` or `News`. |
| `id` | `string` | Yes | ID of the content. |

### Response
> `200 Successful`
```json
{
    "content_type": "Story",  // or "News"
    "language": "French",
    "cefr_level": "B2",
    "topic": "Politics",
    "date_created": "2024-03-20",
    "title": "A Very Cool Title",
    "preview_text": "A preview of the content...",
    "dictionary": {
        "translations": {
            "words": {
                "J'aime": "I like",
                "Squeak": "Squeak",
                "beaucoup": "a lot"
            },
            "sentences": {
                "J'aime Squeak beaucoup": "I like Squeak a lot"
            }
        }
    }
}
```

For News content, the response will also include a `sources` field:
```json
{
    // ... other fields as above ...
    "sources": [
        {
            "title": "Source Article Title",
            "url": "https://source.url",
            "content": "Source article content",
            "score": 0.9865718
        }
    ]
}
```

### **GET** `/story`
> https://api.squeak.today/story

Pulls generated story data as JSON. Pass `language`, `cefr`, and `subject` as fields.
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | `string` | Yes | Current supported languages are `French`. |
| `cefr` | `string` | Yes | Must be one of `A1`, `A2`, `B1`, `B2`, `C1`, `C2`. |
| `subject` | `string` | Yes | e.g `Politics`. |
| `date_created` | `string` | Yes | e.g `2025-01-01`. |

### Response
> `200 Successful`
```json
{
	"content": "J'aime Squeak beaucoup.",
	"dictionary": {
		"translations": {
			"words": {
				"J'aime": "I like",
				"Squeak": "Squeak",
				"beaucoup": "a lot"
			},
			"sentences": {
				"J'aime Squeak beaucoup": "I like Squeak a lot"
			}
		}
	}
}
```

### **GET** `/news`
> https://api.squeak.today/news

Pulls generated news article data as JSON. Pass `language`, `cefr`, and `subject` as fields.
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | `string` | Yes | Current supported languages are `French`. |
| `cefr` | `string` | Yes | Must be one of `A1`, `A2`, `B1`, `B2`, `C1`, `C2`. |
| `subject` | `string` | Yes | e.g `Politics`. |
| `date_created` | `string` | Yes | e.g `2025-01-01`. |

### Response
> `200 Successful`
```json
{
	"content": "Donald Trump aime Squeak beaucoup.",
	"dictionary": {
		"translations": {
			"words": {
				"Donald": "Donald",
				"Trump": "Trump",
				"aime": "like",
				"Squeak": "Squeak",
				"beaucoup": "a lot"
			},
			"sentences": {
				"Donald Trump aime Squeak beaucoup": "Donald Trump likes Squeak a lot"
			}
		}
	},
	"sources": [
		{
			"title": "Donald Trump thinks Squeak is the best!",
			"url": "https://www.super-weird-news.com/donald-trump-squeak",
			"content": "In a very fake interview with Donald Trump, Squeak representative Joe Biden asked Donald Trump if he liked Squeak. He said yes!",
			"score": 0.9865718
		}
	]
}
```

### **POST** `/translate`
> https://api.squeak.today/translate

Translates a given sentence to English and returns the result.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `sentence` | `string` | Yes | Sentence to translate. |
| `source` | `string` | Yes | Source language. e.g `fr` |
| `target` | `string` | Yes | Language to translate to. e.g `en` |

### Headers
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Response
> `200 Successful`
```json
{
	"sentence": "the translated sentence."
}
```

### **POST** `/evaluate-qna`
> https://api.squeak.today/evaluate-qna

Evaluates a user's answer to a question about a given content.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `cefr` | `string` | Yes | CEFR level of the content, question, answer. |
| `content` | `string` | Yes | Content to evaluate on. |
| `question` | `string` | Yes | Question to evaluate on. |
| `answer` | `string` | Yes | User's answer to evaluate. |

### Headers
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Response
> `200 Successful`
```json
{
	"evaluation": "PASS" // or "FAIL"
}
```

### **GET** `/news-query`
> https://api.squeak.today/news-query

Query Supabase for news articles.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | `string` | Yes | Can be set to `any` to return all languages. e.g `French` |
| `cefr` | `string` | Yes | Can be set to `any` to return all CEFR levels. e.g `B2` |
| `subject` | `string` | Yes | Can be set to `any` to return all subjects. e.g `Politics` |
| `page` | `int` | No | Get a certain page of results. Default `1`. |
| `pagesize` | `int` | No | Get a certain number of results per page. Default `10`. |

### Response
> `200 Successful`
```json
[
    {
        "cefr_level": "A1",
		"date_created": "2024-12-15",
        "created_at": "2025-01-13T04:03:12.846956Z",
        "id": "32",
        "language": "French",
        "preview_text": "The first part of the news article...",
        "title": "A very cool title",
        "topic": "Politics"
    },
    {
        "cefr_level": "A1",
		"date_created": "2024-12-15",
        "created_at": "2025-01-13T04:03:34.499384Z",
        "id": "34",
        "language": "French",
        "preview_text": "Albanese contre Dutton, un duel politique intense\n\nL'Australie est en pleine effervescence politique alors que les élections approchent à grands pas. Le Premier ministre Anthony Albanese et le chef de l'opposition Peter Dutton s'affrontent dans une bataille politique acharnée, chacun cherchant à séduire les électeurs avec des promesses et des critiques acerbes.\n\n## Un paysage politique en évolution\n\nL'Australie, connue pour son paysage politique dynamique, est act...",
        "title": "Les élections australiennes",
        "topic": "Politics"
    }
]
```

### **GET** `/story-query`
> https://api.squeak.today/story-query

Query Supabase for stories.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | `string` | Yes | e.g `French` |
| `cefr` | `string` | Yes | e.g `B2` |
| `subject` | `string` | Yes | e.g `Politics` |
| `page` | `int` | No | Get a certain page of results. Default `1`. |
| `pagesize` | `int` | No | Get a certain number of results per page. Default `10`. |

### Response
> `200 Successful`

See `news-query` response.

### **POST** `/content-question`
> https://api.squeak.today/evaluate-qna

Pulls a given question testing vocabulary (vocab) or understanding (understanding) of a given piece of content by ID. If the question does not exist, another will be generated, stored and returned.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `content_type` | `string` | Yes | Type of content, either `News` or `Story`. |
| `id` | `string` | Yes | ID of the content. |
| `cefr_level` | `string` | Yes | Desired CEFR level of the resulting question. |
| `question_type` | `string` | Yes | Type of question, either `vocab` or `understanding`. |

### Headers
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Response
> `200 Successful`
```json
{
	"question": "What does 'economie' mean?"
}
```

## Examples: `api.squeak.today`
> https://api.squeak.today/news?language=French&cefr=B2&subject=Politics&page=1&pagesize=10
>https://api.squeak.today/story?language=French&cefr=B2&subject=Politics&page=1&pagesize=10

## Adding New Languages
1. Add language to `queue_filler/main.go` as part of the `languages` array.
2. Add language to `lambda/main.go` as part of the `language_ids` map. Note that the language ID is the language code used by Google Translate API, e.g "fr" for French.
3. Update LLMs to fine-tuning on the new language.