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

# Developer Setup
### ***For Squeak Devs Only.***

Our repo consists of X parts:
- `/frontend`
- `/stories`
- `/supabase`
- `/infrastructure`
- 3 lambda functions, `/queue_filler`, `/api` and `/lambda`

### Prerequisites
- Python 3.11.11
- Node.js 18.20.5
- Golang 1.23.4
- Terraform CLI

And for credentials:
- AWS Credentials (at `~/.aws/credentials`)
- API keys (see later `.env` files)
- Supabase Access
- Supabase CLI [optional]

Also, make sure you're on your own branch.

### `/supabase`
This contains migrations for the Supabase database.
To make an isolated environment for your branch, go to the Supabase dashboard.
1. Click the top where it says `main Production` > Manage Branches
2. `Create Branch`.
3. Input the EXACT name of your branch.
Please note that this supabase branch is now connected to your git branch.
When the branch is opened, it will automatically execute all of the migrations in the `/supabase/migrations` directory into this new supabase instance. 
> If you are adding new migrations, you MUST ensure they are idempotent. Be careful when relaxing constraints, as future data may not conform to the earlier versions of the constraints, and thus cause migrations failure on the earlier one.

This Supabase instance will have its own connection strings, i.e its own host to be used later.
Generate a password for the database:
`Project Settings > Database > Reset Database Password`

When ready:
1. Create a PR
2. Wait for checks to pass (including Supabase migrations check)
3. Merge after approval
4. If merged in `main`, Supabase will automatically apply any new migrations you created to the production instance. 

**It is possible for migrations to fail on main, but not on the branch. Pay attention to it.**

### 3 lambda functions
There is a `./build-lambdas.sh` script that will build the lambdas and place the zips in the `/infrastructure` directory.
In general, this needs to be run before every `infrastructure` deployment to keep changes properly updated.

### `/infrastructure`
Ensure that you've created your own workspace on Terraform Cloud.
```shell
cd infrastructure
terraform login # follow the instructions to login
```

You'll then want to modify the `/infrastructure/main.tf`:
```tf
---tags = ["shared"]
+++name = "<your-workspace-name>"
```
*This will tell Terraform to target your workspace.*

> The "shared" tag refers to the `dev` and `prod` workspaces. When pushing to either of these, you should switch back to the original, as that will let terraform know that those are your target workspaces.

```shell
terraform workspace select <your-workspace-name> # not necessarily needed, but good practice to double check which one you're in

terraform init # inits modules
cp environments/example.tfvars environments/branch.tfvars
```
You can now fill the new `.tfvars` with the API keys and the supabase connection values for transaction pooling.

```shell
terraform plan -var-file="environments/branch.tfvars"
terraform apply -var-file="environments/branch.tfvars"
```
This will create various resources, including:
- S3 bucket
- SQS queue
- Lambda functions
- etc.
They will all be tagged with your workspace name at the start, e.g `workspacename-content-bucket-XXX`.

When ready, `terraform destroy -var-file="environments/branch.tfvars"`

The supabase instance and S3 bucket will be spawned with no news or stories data. 

If you need to populate them with dummy data for testing, you can do the following:
```shell
# at the root, not /infrastructure
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 create_dummy_news.py
python3 create_dummy_stories.py
```

## `/frontend`
```shell
cp .env.example .env
```
On the Supabase dashboard, `Connect > App Frameworks > React`.
Run with `npm start`.

## `/stories`
Contains some stories in MDX format, and scripts to upload them to S3.
Developed on `Python 3.11.11`.

Make sure you have the .aws credentials.
```shell
pip install boto3
python -m venv venv
source venv/bin/activate
python upload_story.py XXX --language X --cefr X --topic X --bucket X
```

To add stories:
1. Write the pages in MDX format.
2. Write a context.txt file that has all the necessary context to answer the questions you create.
3. Upload to S3.
4. Add all the questions to the supabase `questions` table.
As of writing, to add support for all levels of studying questions, you need to add:
- 1 vocab question
- 1 understanding question for each level of CEFR up to the story's CEFR level.

All available widgets for use in story writing are in `frontend/src/components/StoryWidgets.js`.

### `/supabase` (semi-optional)
Contains migrations for Supabase db.
In the Supabase online dashboard, make a branch with the same name as the branch you are developing.
That branch should be used as your Supabase testing environment.

# REST API Backend
**IMPORTANT**: All API endpoints need to be called with a `Authorization: Bearer <JWT Token>` header.

| Endpoint | Type | Description | 
| --- | --- | --- |
| `/story` | `GET` | Pull a story page by ID. |
| `/story/context` | `GET` | Pull QNA context for a story. |
| `/story/query` | `GET` | Query Supabase for stories. |
| `/news` | `GET` | Pull a news article by ID. |
| `/news/query` | `GET` | Query Supabase for news articles. |
| `/profile` | `GET` | Get a user's profile. |
| `/profile/upsert` | `POST` | Upsert a user's profile. |
| `/qna` | `POST` | Generate a question testing vocabulary or understanding of a given piece of content. |
| `/qna/evaluate` | `POST` | Evaluation of a user's answer to a question about a given content. |
| `/progress` | `GET` | Get today's progress for the authenticated user. |
| `/progress/increment` | `POST` | Increment the number of questions completed for today. |
| `/progress/streak` | `GET` | Get the user's current streak information. |
| `/audio` | `GET` | Health check for audio services. |
| `/audio/translate` | `POST` | Translation of given sentence to target language. |
| `/audio/tts` | `POST` | Convert text to speech audio. |
| `/teacher` | `GET` | Check if the authenticated user is a teacher. |
| `/teacher/classroom` | `GET` | Get the classroom information for the authenticated teacher. |
| `/teacher/classroom/create` | `POST` | Create a new classroom for the authenticated teacher. |
| `/teacher/classroom/accept` | `POST` | Accept content for a classroom. |
| `/teacher/classroom/reject` | `POST` | Reject content from a classroom. |
| `/student` | `GET` | Get the authenticated user's student information. |
| `/student/classroom` | `GET` | Get the classroom information for the authenticated student. |
| `/student/classroom/join` | `POST` | Join a classroom as a student. |

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
    "interested_topics": ["Business", "NBA", "NFL", "Football"],
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

### **GET** `/audio`
> https://api.squeak.today/audio

Health check endpoint for audio services.

### Response
> `200 Successful`
```json
{
    "status": "live"
}
```

### **POST** `/audio/translate`
> https://api.squeak.today/audio/translate

Translates a given sentence between specified languages.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `sentence` | `string` | Yes | Sentence to translate. |
| `source` | `string` | Yes | Source language code (e.g., `fr`). |
| `target` | `string` | Yes | Target language code (e.g., `en`). |

### Headers
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Response
> `200 Successful`
```json
{
    "sentence": "The translated sentence."
}
```
### **POST** `/audio/tts`
> https://api.squeak.today/audio/tts

Converts text to speech using Google Cloud Text-to-Speech API.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Text to convert to speech. |
| `language_code` | `string` | Yes | Language code (e.g., `fr-FR`, `en-US`). |
| `voice_name` | `string` | Yes | Voice name (e.g., `fr-FR-Standard-A`). |

### Headers
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Response
> `200 Successful`
```json
{
    "audio_content": "base64-encoded audio content"
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

### **POST** `/teacher/classroom/accept`
> https://api.squeak.today/teacher/classroom/accept

Accept content for a classroom. Only the teacher of the classroom can accept content.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `content_type` | `string` | Yes | Type of content, either `Story` or `News`. |
| `content_id` | `int` | Yes | ID of the content to accept. |

### Response
> `200 Successful`
```json
{
    "message": "Content accepted successfully"
}
```

### **POST** `/teacher/classroom/reject`
> https://api.squeak.today/teacher/classroom/reject

Reject content from a classroom. Only the teacher of the classroom can reject content.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `content_type` | `string` | Yes | Type of content, either `Story` or `News`. |
| `content_id` | `int` | Yes | ID of the content to reject. |

### Response
> `200 Successful`
```json
{
    "message": "Content rejected successfully"
}
```

### **GET** `/student`
> https://api.squeak.today/student

Get the authenticated user's student information.

### Response
> `200 Successful`
```json
{
    "student_id": "XXX",
    "classroom_id": "YYY"
}
```

### **GET** `/student/classroom`
> https://api.squeak.today/student/classroom

Get the classroom information for the authenticated student.

### Response
> `200 Successful`
```json
{
    "teacher_id": "XXX",
    "students_count": 5
}
```

### **POST** `/student/classroom/join`
> https://api.squeak.today/student/classroom/join

Join a classroom as a student.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `classroom_id` | `string` | Yes | ID of the classroom to join. |

### Response
> `200 Successful`
```json
{
    "message": "Student added to classroom"
}
```
