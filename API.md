# Squeak API
Backend API for Squeak Platform

## Version: 1.0

### Security
**Bearer**  

| apiKey | *API Key* |
| ------ | --------- |
| Description | JWT Authorization header using Bearer |
| In | header |
| Name | Authorization |

---
### /audio

#### GET
##### Summary

Check audio service health

##### Description

Check if the audio service is live

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.AudioHealthResponse](#modelsaudiohealthresponse) |

### /audio/translate

#### POST
##### Summary

Translate text

##### Description

Translate text from source language to target language

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Translation request | Yes | [models.TranslateRequest](#modelstranslaterequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.TranslateResponse](#modelstranslateresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

### /audio/tts

#### POST
##### Summary

Text to speech

##### Description

Convert text to speech audio

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Text to speech request | Yes | [models.TextToSpeechRequest](#modelstexttospeechrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.TextToSpeechResponse](#modelstexttospeechresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

---
### /news

#### GET
##### Summary

Get news content

##### Description

Get news content by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | query | Content ID | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetNewsResponse](#modelsgetnewsresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

### /news/query

#### GET
##### Summary

Get news content

##### Description

Get news content by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| language | query | Language | Yes | string |
| cefr | query | CEFR | Yes | string |
| subject | query | Subject | Yes | string |
| page | query | Page | Yes | string |
| pagesize | query | Page size | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [ [models.NewsItem](#modelsnewsitem) ] |

---
### /profile

#### GET
##### Summary

Get user profile

##### Description

Get the user's profile information

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetProfileResponse](#modelsgetprofileresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |

### /profile/upsert

#### POST
##### Summary

Upsert user profile

##### Description

Create or update the user's profile

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Profile information | Yes | [models.UpsertProfileRequest](#modelsupsertprofilerequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.UpsertProfileResponse](#modelsupsertprofileresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 409 | Conflict | [models.ErrorResponse](#modelserrorresponse) |

---
### /progress

#### GET
##### Summary

Get today's progress

##### Description

Get the user's progress for today

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.TodayProgressResponse](#modelstodayprogressresponse) |

### /progress/increment

#### GET
##### Summary

Increment questions completed

##### Description

Increment the number of questions completed for today

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| amount | query | Amount to increment by | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.IncrementProgressResponse](#modelsincrementprogressresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

### /progress/streak

#### GET
##### Summary

Get streak information

##### Description

Get the user's current streak and completion status

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.StreakResponse](#modelsstreakresponse) |

---
### /qna

#### POST
##### Summary

Get or generate a question

##### Description

Get an existing question or generate a new one for the given content

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Question request parameters | Yes | [models.GetQuestionRequest](#modelsgetquestionrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetQuestionResponse](#modelsgetquestionresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |

### /qna/evaluate

#### POST
##### Summary

Evaluate an answer

##### Description

Evaluate a user's answer to a question

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Answer evaluation request | Yes | [models.EvaluateAnswerRequest](#modelsevaluateanswerrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.EvaluateAnswerResponse](#modelsevaluateanswerresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

---
### /story

#### GET
##### Summary

Get story page content

##### Description

Get story content by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | query | Content ID | Yes | string |
| page | query | Page | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetStoryPageResponse](#modelsgetstorypageresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |

### /story/context

#### GET
##### Summary

Get story QNA context

##### Description

Get story QNA context by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | query | Content ID | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetStoryQNAContextResponse](#modelsgetstoryqnacontextresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |

---
### /student

#### GET
##### Summary

Check user student status

##### Description

Check if the user is a student and get their classroom info

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.StudentStatusResponse](#modelsstudentstatusresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /student/classroom

#### GET
##### Summary

Get classroom info

##### Description

Get classroom info for the student

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetStudentClassroomResponse](#modelsgetstudentclassroomresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /student/classroom/join

#### POST
##### Summary

Join classroom

##### Description

Join a classroom as a student

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Join classroom request | Yes | [models.JoinClassroomRequest](#modelsjoinclassroomrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.JoinClassroomResponse](#modelsjoinclassroomresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

---
### /teacher

#### GET
##### Summary

Check user teacher status

##### Description

Check if the user is a teacher

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.TeacherStatusResponse](#modelsteacherstatusresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /teacher/classroom

#### GET
##### Summary

Get classroom info

##### Description

Get classroom info

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.GetClassroomInfoResponse](#modelsgetclassroominforesponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /teacher/classroom/accept

#### POST
##### Summary

Accept content

##### Description

Accept content

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Accept content request | Yes | [models.AcceptContentRequest](#modelsacceptcontentrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.AcceptContentResponse](#modelsacceptcontentresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /teacher/classroom/content

#### GET
##### Summary

Query classroom content

##### Description

Query classroom content

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| language | query | Language | Yes | string |
| cefr | query | CEFR | Yes | string |
| subject | query | Subject | Yes | string |
| page | query | Page | Yes | string |
| pagesize | query | Page size | Yes | string |
| whitelist | query | Whitelist status | Yes | string |
| content_type | query | Content type | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [ [models.ClassroomContentItem](#modelsclassroomcontentitem) ] |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /teacher/classroom/create

#### POST
##### Summary

Create classroom

##### Description

Create classroom

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Create classroom request | Yes | [models.CreateClassroomRequest](#modelscreateclassroomrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.CreateClassroomResponse](#modelscreateclassroomresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

### /teacher/classroom/reject

#### POST
##### Summary

Accept content

##### Description

Accept content

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Reject content request | Yes | [models.RejectContentRequest](#modelsrejectcontentrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.RejectContentResponse](#modelsrejectcontentresponse) |
| 403 | Forbidden | [models.ErrorResponse](#modelserrorresponse) |

---
### Models

#### models.AcceptContentRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| content_id | integer | *Example:* `123` | No |
| content_type | string | *Example:* `"News"` | Yes |

#### models.AcceptContentResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string | *Example:* `"Content accepted successfully"` | Yes |

#### models.AudioHealthResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| status | string | *Example:* `"live"` | Yes |

#### models.ClassroomContentItem

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cefr_level | string | *Example:* `"B1"` | Yes |
| content_type | string | *Example:* `"News"` | Yes |
| created_at | string | *Example:* `"2025-02-26T13:01:13.390612Z"` | Yes |
| date_created | string | *Example:* `"2025-02-26"` | Yes |
| id | string | *Example:* `"2479"` | Yes |
| language | string | *Example:* `"French"` | Yes |
| pages | integer | *Example:* `10` | Yes |
| preview_text | string | *Example:* `"# L'actualité musicale en bref\n\n## Un flot de nouveautés..."` | Yes |
| title | string | *Example:* `"# L'actualité musicale en bref\n\n## Un fl..."` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.CreateClassroomRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| students_count | integer | *Example:* `10` | No |

#### models.CreateClassroomResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | Yes |

#### models.ErrorResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | string | *Example:* `"PROFILE_NOT_FOUND"` | No |
| error | string | *Example:* `"Something went wrong"` | Yes |

#### models.EvaluateAnswerRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| answer | string | *Example:* `"Hello"` | Yes |
| cefr | string | *Example:* `"B1"` | Yes |
| content | string | *Example:* `"Bonjour, comment ça va?"` | Yes |
| question | string | *Example:* `"What does 'bonjour' mean?"` | Yes |

#### models.EvaluateAnswerResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| evaluation | string | *Example:* `"PASS"` | Yes |
| explanation | string | *Example:* `"Perfect!"` | Yes |

#### models.GetClassroomInfoResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | Yes |
| students_count | integer | *Example:* `10` | No |

#### models.GetNewsResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cefr_level | string | *Example:* `"B1"` | Yes |
| content | string | *Example:* `"Le contenu complet de l'article..."` | Yes |
| content_type | string | *Example:* `"News"` | Yes |
| date_created | string | *Example:* `"2024-02-26"` | Yes |
| dictionary | [storage.Dictionary](#storagedictionary) |  | Yes |
| language | string | *Example:* `"French"` | Yes |
| preview_text | string | *Example:* `"Un résumé des nouvelles musicales..."` | Yes |
| sources | [ [storage.Source](#storagesource) ] |  | Yes |
| title | string | *Example:* `"L'actualité musicale en bref"` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.GetProfileResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| daily_questions_goal | integer | *Example:* `3` | No |
| interested_topics | [ string ] | *Example:* `["[\"NBA\"]"]` | Yes |
| learning_language | string | *Example:* `"French"` | Yes |
| skill_level | string | *Example:* `"B1"` | Yes |
| username | string | *Example:* `"connortbot"` | Yes |

#### models.GetQuestionRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cefr_level | string | *Example:* `"B1"` | Yes |
| content_type | string | *Example:* `"News"` | Yes |
| id | string | *Example:* `"123"` | Yes |
| question_type | string | *Enum:* `"vocab"`, `"understanding"`<br>*Example:* `"vocab"` | Yes |

#### models.GetQuestionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| question | string | *Example:* `"What does 'bonjour' mean?"` | Yes |

#### models.GetStoryPageResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cefr_level | string | *Example:* `"B1"` | Yes |
| content | string | *Example:* `"Le contenu complet de l'article..."` | Yes |
| content_type | string | *Example:* `"Story"` | Yes |
| date_created | string | *Example:* `"2024-02-26"` | Yes |
| language | string | *Example:* `"French"` | Yes |
| pages | integer | *Example:* `10` | Yes |
| preview_text | string | *Example:* `"Un résumé des nouvelles musicales..."` | Yes |
| title | string | *Example:* `"L'actualité musicale en bref"` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.GetStoryQNAContextResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| context | string | *Example:* `"Le contexte de l'histoire..."` | Yes |

#### models.GetStudentClassroomResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| students_count | integer | *Example:* `10` | No |
| teacher_id | string | *Example:* `"789"` | Yes |

#### models.IncrementProgressResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| date | string | *Example:* `"2025-02-26T00:00:00Z"` | Yes |
| goal_met | boolean | *Example:* `true` | Yes |
| questions_completed | integer | *Example:* `5` | No |
| user_id | string | *Example:* `"123"` | Yes |

#### models.JoinClassroomRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | Yes |

#### models.JoinClassroomResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string | *Example:* `"Student added to classroom successfully"` | Yes |

#### models.NewsItem

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cefr_level | string | *Example:* `"B1"` | Yes |
| created_at | string | *Example:* `"2024-02-26T13:01:13.390612Z"` | Yes |
| date_created | string | *Example:* `"2024-02-26"` | Yes |
| id | string | *Example:* `"123"` | Yes |
| language | string | *Example:* `"French"` | Yes |
| preview_text | string | *Example:* `"Un résumé des nouvelles musicales..."` | Yes |
| title | string | *Example:* `"L'actualité musicale en bref"` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.RejectContentRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| content_id | integer | *Example:* `123` | No |
| content_type | string | *Example:* `"News"` | Yes |

#### models.RejectContentResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string | *Example:* `"Content rejected successfully"` | Yes |

#### models.StreakResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| completed_today | boolean | *Example:* `true` | Yes |
| streak | integer | *Example:* `7` | No |

#### models.StudentStatusResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"456"` | Yes |
| student_id | string | *Example:* `"123"` | Yes |

#### models.TeacherStatusResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| exists | boolean | *Example:* `true` | Yes |

#### models.TextToSpeechRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| language_code | string | *Example:* `"en-US"` | Yes |
| text | string | *Example:* `"Hello, how are you?"` | Yes |
| voice_name | string | *Example:* `"en-US-Standard-A"` | Yes |

#### models.TextToSpeechResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| audio_content | string | *Example:* `"base64-encoded-audio-content"` | Yes |

#### models.TodayProgressResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| date | string | *Example:* `"2025-02-26T00:00:00Z"` | Yes |
| goal_met | boolean | *Example:* `true` | Yes |
| questions_completed | integer | *Example:* `5` | No |
| user_id | string | *Example:* `"123"` | Yes |

#### models.TranslateRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| sentence | string | *Example:* `"Hello, how are you?"` | Yes |
| source | string | *Example:* `"en"` | Yes |
| target | string | *Example:* `"fr"` | Yes |

#### models.TranslateResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| sentence | string | *Example:* `"Bonjour, comment allez-vous?"` | No |

#### models.UpsertProfileRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| daily_questions_goal | integer | *Example:* `3` | No |
| interested_topics | [ string ] | *Example:* `["[\"NBA\"]"]` | Yes |
| learning_language | string | *Example:* `"French"` | Yes |
| skill_level | string | *Example:* `"B1"` | Yes |
| username | string | *Example:* `"johndoe"` | Yes |

#### models.UpsertProfileResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer | *Example:* `123` | No |
| message | string | *Example:* `"Profile updated successfully"` | Yes |

#### storage.Dictionary

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| translations | { **"sentences"**: object, **"words"**: object } |  | No |

#### storage.Source

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| content | string |  | No |
| score | number |  | No |
| title | string |  | No |
| url | string |  | No |
