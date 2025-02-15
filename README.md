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

### `/stories`
Contains some stories in MDX format, and scripts to upload them to S3.
Developed on `Python 3.11.11`.

Make sure you have the .aws credentials.
```shell
pip install boto3
python -m venv venv
source venv/bin/activate
python upload_story.py XXX --language X --cefr X --topic X --bucket X
```

Adding stories:
1. Write the pages in MDX format.
2. Write a context.txt file that has all the necessary context to answer the questions you create.
3. Upload to S3.
4. Add all the questions to the supabase `questions` table.
As of writing, to add support for all levels of studying questions, you need to add:
- 1 vocab question
- 1 understanding question for each level of CEFR up to the story's CEFR level.

All available widgets for use in story writing are in `frontend/src/components/StoryWidgets.js`.

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
| `/story` | `GET` | Pull a story page by ID. |
| `/story/context` | `GET` | Pull QNA context for a story. |
| `/story/query` | `GET` | Query Supabase for stories. |
| `/news` | `GET` | Pull a news article by ID. |
| `/news/query` | `GET` | Query Supabase for news articles. |
| `/profile` | `GET` | Get a user's profile. |
| `/profile/upsert` | `POST` | Upsert a user's profile. |
| `/translate` | `POST` | Translation of given sentence to source language. |
| `/qna` | `POST` | Generate a question testing vocabulary or understanding of a given piece of content. |
| `/qna/evaluate` | `POST` | Evaluation of a user's answer to a question about a given content. |
| `/progress` | `GET` | Get today's progress for the authenticated user. |
| `/progress/increment` | `POST` | Increment the number of questions completed for today. |
| `/progress/streak` | `GET` | Get the user's current streak information. |
| `/teacher` | `GET` | Check if the authenticated user is a teacher. |
| `/teacher/classroom` | `GET` | Get the classroom information for the authenticated teacher. |
| `/teacher/classroom/create` | `POST` | Create a new classroom for the authenticated teacher. |

### **GET** `/story`
> https://api.squeak.today/story

Pulls a specific page of a story by ID.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | ID of the story. |
| `page` | `string` | Yes | Page number to retrieve. |

### Response
> `200 Successful`
```json
{
    "content_type": "Story",
    "language": "French",
    "cefr_level": "B2",
    "topic": "Politics",
    "date_created": "2024-03-20",
    "title": "A Very Cool Title",
    "preview_text": "A preview of the content...",
    "content": "The story content in MDX format...",
    "pages": 10
}
```

### **GET** `/story/context`
> https://api.squeak.today/story/context

Pulls the QNA context for a story by ID.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | ID of the story. |

### Response
> `200 Successful`
```json
{
    "context": "Context text for question generation..."
}
```

### **GET** `/news`
> https://api.squeak.today/news

Pulls a news article by ID.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | ID of the news article. |

### Response
> `200 Successful`
```json
{
    "content_type": "News",
    "language": "French",
    "cefr_level": "B2",
    "topic": "Politics",
    "date_created": "2024-03-20",
    "title": "A Very Cool Title",
    "preview_text": "A preview of the content...",
    "content": "The news article content...",
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
    },
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

### **POST** `/qna/evaluate`
> https://api.squeak.today/qna/evaluate

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
    "explanation": "Make sure you conjugate avoir correctly!"
}
```

### **GET** `/news/query`
> https://api.squeak.today/news/query

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

### **GET** `/story/query`
> https://api.squeak.today/story/query

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

See `news/query` response.
Each story has a `pages` field, which is the number of pages in the story.

### **POST** `/qna`
> https://api.squeak.today/qna

Pulls a given question testing vocabulary (vocab) or understanding (understanding) of a given piece of content by ID. 

If the question does not exist, another will be generated, stored and returned.
(This only occurs for news articles. Stories are expected to have existing questions.)

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

### **GET** `/profile`
> https://api.squeak.today/profile

Get a user's profile.

### Response
> `200 Successful`
```json
{
    "username": "Connor",
    "learning_language": "French",
    "skill_level": "A2",
    "interested_topics": ["Business", "Sports"],
    "daily_questions_goal": 5
}
```

Will return `"code": "PROFILE_NOT_FOUND"` as a JSON field if the profile does not exist.

### **POST** `/profile/upsert`
> https://api.squeak.today/profile/upsert

Upsert a user's profile.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | `string` | Yes | Username of the user. |
| `learning_language` | `string` | Yes | Language the user is learning. |
| `skill_level` | `string` | Yes | CEFR level of the user's proficiency. |
| `interested_topics` | `[]string` | Yes | Topics the user is interested in. |
| `daily_questions_goal` | `int` | Yes | Number of questions the user wants to answer per day. |

### Response
> `200 Successful`
```json
{
    "id": 1,
    "message": "Profile updated successfully"
}
```

### **GET** `/progress`
> https://api.squeak.today/progress/

Get today's progress for the authenticated user.

### Response
> `200 Successful`
```json
{
    "user_id": "XXXX...",
    "date": "2024-02-07",
    "questions_completed": 5,
    "goal_met": true
}
```

### **GET** `/progress/increment`
> https://api.squeak.today/progress/increment

Increment the number of questions completed for today.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | `int` | Yes | Amount to increment by. Must be non-negative. |

### Response
> `200 Successful`
```json
{
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "date": "2024-02-07",
    "questions_completed": 6,
    "goal_met": true
}
```

### **GET** `/progress/streak`
> https://api.squeak.today/progress/streak

Get the user's current streak information.

### Response
> `200 Successful`
```json
{
    "streak": 5,
    "completed_today": true
}
```

### **GET** `/teacher`
> https://api.squeak.today/teacher

Check if the authenticated user is a teacher.

### Response
> `200 Successful`
```json
{
    "exists": true
}
```

### **GET** `/teacher/classroom`
> https://api.squeak.today/teacher/classroom

Get the classroom information for the authenticated teacher.

### Response
> `200 Successful`
```json
{
    "classroom_id": "XXX",
    "students_count": 5
}
```

### **POST** `/teacher/classroom/create`
> https://api.squeak.today/teacher/classroom/create

Create a new classroom for the authenticated teacher.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `students_count` | `int` | Yes | Number of students in the classroom. |

### Response
> `200 Successful`
```json
{
    "classroom_id": "XXX"
}
```