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

### /audio/audiobook

#### GET
##### Summary

Get audiobook

##### Description

Get audiobook for a news_id

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| news_id | query | News ID | No | string |
| story_id | query | Story ID | No | string |
| type | query | story | Yes | string |
| page | query | 1 | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.AudiobookResponse](#modelsaudiobookresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |

### /audio/stt

#### POST
##### Summary

Speech to text

##### Description

Convert speech audio to text

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Speech to text request | Yes | [models.SpeechToTextRequest](#modelsspeechtotextrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.SpeechToTextResponse](#modelsspeechtotextresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

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
### /billing

#### GET
##### Summary

Check Billing Account

##### Description

Check Billing Account

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.BillingAccountResponse](#modelsbillingaccountresponse) |
| 401 | Unauthorized | [models.ErrorResponse](#modelserrorresponse) |

### /billing/cancel-subscription-eop

#### POST
##### Summary

Cancel a Stripe individual subscription at the end of the period

##### Description

Cancel a Stripe individual subscription at the end of the period

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Cancel subscription request | Yes | [models.CancelIndividualSubscriptionRequest](#modelscancelindividualsubscriptionrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.CancelIndividualSubscriptionResponse](#modelscancelindividualsubscriptionresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

### /billing/create-checkout-session

#### POST
##### Summary

Create a Stripe checkout session (individual)

##### Description

Creates a checkout session and redirects to Stripe's payment page

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| request | body | Create checkout session request | Yes | [models.CreateIndividualCheckoutSessionRequest](#modelscreateindividualcheckoutsessionrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Redirect to Stripe Checkout | [models.CreateIndividualCheckoutSessionResponse](#modelscreateindividualcheckoutsessionresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

### /billing/usage

#### GET
##### Summary

Get Billing Account Usage

##### Description

Get Billing Account Usage, assumes free plan

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| plan | query | Plan | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.BillingAccountUsageResponse](#modelsbillingaccountusageresponse) |
| 401 | Unauthorized | [models.ErrorResponse](#modelserrorresponse) |

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

### /story/query

#### GET
##### Summary

Get story query

##### Description

Get story query by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| language | query | Language | Yes | string |
| cefr | query | CEFR | Yes | string |
| subject | query | Subject | Yes | string |
| page | query | Page | Yes | string |
| pagesize | query | Page Size | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [ [models.StoryItem](#modelsstoryitem) ] |

---
### /webhook

#### POST
##### Summary

Process Stripe webhook

##### Description

Validates and processes incoming webhook events from Stripe

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [models.WebhookResponse](#modelswebhookresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |

---
### /workspaces

#### GET
##### Summary

Get workspaces

##### Description

Get workspaces

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [workspaces.GetWorkspacesResponse](#workspacesgetworkspacesresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

### /workspaces/{workspace_id}/databases/{database_id}/content/create

#### POST
##### Summary

Create content

##### Description

Create content

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| workspace_id | path | Workspace ID | Yes | string |
| database_id | path | Database ID | Yes | string |
| content | body | Body | Yes | [workspaces.CreateContentRequest](#workspacescreatecontentrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [workspaces.CreateContentResponse](#workspacescreatecontentresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

### /workspaces/{workspace_id}/databases/{database_id}/query

#### POST
##### Summary

Query database

##### Description

Query database

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| workspace_id | path | Workspace ID | Yes | string |
| database_id | path | Database ID | Yes | string |
| body | body | Body | Yes | [workspaces.QueryDatabaseRequest](#workspacesquerydatabaserequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [workspaces.QueryDatabaseResponse](#workspacesquerydatabaseresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

### /workspaces/{workspace_id}/databases/create

#### POST
##### Summary

Create database

##### Description

Create database

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| workspace_id | path | Workspace ID | Yes | string |
| body | body | Body | Yes | [workspaces.CreateDatabaseRequest](#workspacescreatedatabaserequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [workspaces.CreateDatabaseResponse](#workspacescreatedatabaseresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

### /workspaces/create

#### POST
##### Summary

Create workspace

##### Description

Create workspace

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| body | body | Body | Yes | [workspaces.CreateWorkspaceRequest](#workspacescreateworkspacerequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [workspaces.CreateWorkspaceResponse](#workspacescreateworkspaceresponse) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

### /workspaces/summary

#### GET
##### Summary

Get workspaces

##### Description

Get workspaces

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | OK | [workspaces.WorkspacesSummary](#workspacesworkspacessummary) |
| 400 | Bad Request | [models.ErrorResponse](#modelserrorresponse) |
| 404 | Not Found | [models.ErrorResponse](#modelserrorresponse) |
| 500 | Internal Server Error | [models.ErrorResponse](#modelserrorresponse) |

---
### Models

#### models.AudioHealthResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| status | string | *Example:* `"live"` | Yes |

#### models.AudiobookResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| expires_in | integer | *Example:* `300` | Yes |
| url | string | *Example:* `"https://bucket.s3.amazonaws.com/path/to/file?signed-params"` | Yes |

#### models.BillingAccountResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| canceled | boolean | *Example:* `false` | Yes |
| expiration | string | *Example:* `"2025-01-01T00:00:00Z"` | Yes |
| plan | string | *Example:* `"PRO"` | Yes |

#### models.BillingAccountUsageResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| max_natural_tts_usage | integer | *Example:* `100` | Yes |
| max_premium_audiobooks_usage | integer | *Example:* `100` | Yes |
| max_premium_stt_usage | integer | *Example:* `100` | Yes |
| natural_tts_usage | integer | *Example:* `10` | Yes |
| premium_audiobooks_usage | integer | *Example:* `10` | Yes |
| premium_stt_usage | integer | *Example:* `10` | Yes |

#### models.CancelIndividualSubscriptionRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| models.CancelIndividualSubscriptionRequest | object |  |  |

#### models.CancelIndividualSubscriptionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| canceled_plan | string | *Example:* `"PREMIUM"` | Yes |
| current_expiration | string | *Example:* `"2025-03-24T12:00:00Z"` | Yes |
| success | boolean | *Example:* `true` | Yes |

#### models.CreateIndividualCheckoutSessionRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| models.CreateIndividualCheckoutSessionRequest | object |  |  |

#### models.CreateIndividualCheckoutSessionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| redirect_url | string | *Example:* `"https://checkout.stripe.com/c/pay/123"` | Yes |

#### models.ERROR_CODE

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| models.ERROR_CODE | string |  |  |

#### models.ErrorResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | [models.ERROR_CODE](#modelserror_code) | *Enum:* `"PROFILE_NOT_FOUND"`, `"NO_TRANSCRIPT"`, `"AUTH_REQUIRED"`, `"USAGE_LIMIT_REACHED"`, `"USAGE_RESTRICTED"`<br>*Example:* `"PROFILE_NOT_FOUND"` | No |
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

#### models.IncrementProgressResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| date | string | *Example:* `"2025-02-26T00:00:00Z"` | Yes |
| goal_met | boolean | *Example:* `true` | Yes |
| questions_completed | integer | *Example:* `5` | No |
| user_id | string | *Example:* `"123"` | Yes |

#### models.NewsItem

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| audiobook_tier | string | *Example:* `"NONE"` | Yes |
| cefr_level | string | *Example:* `"B1"` | Yes |
| created_at | string | *Example:* `"2024-02-26T13:01:13.390612Z"` | Yes |
| date_created | string | *Example:* `"2024-02-26"` | Yes |
| id | string | *Example:* `"123"` | Yes |
| language | string | *Example:* `"French"` | Yes |
| preview_text | string | *Example:* `"Un résumé des nouvelles musicales..."` | Yes |
| title | string | *Example:* `"L'actualité musicale en bref"` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.SpeechToTextRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| audio_content | string | *Example:* `"base64-encoded-audio-content"` | Yes |
| language_code | string | *Example:* `"en-US"` | Yes |
| premium | boolean | *Example:* `false` | No |

#### models.SpeechToTextResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| transcript | string | *Example:* `"Hello, how are you?"` | Yes |

#### models.StoryItem

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| audiobook_tier | string | *Example:* `"NONE"` | Yes |
| cefr_level | string | *Example:* `"B1"` | Yes |
| created_at | string | *Example:* `"2024-02-26T13:01:13.390612Z"` | Yes |
| date_created | string | *Example:* `"2024-02-26"` | Yes |
| id | string | *Example:* `"123"` | Yes |
| language | string | *Example:* `"French"` | Yes |
| preview_text | string | *Example:* `"Un résumé des nouvelles musicales..."` | Yes |
| title | string | *Example:* `"L'actualité musicale en bref"` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.StreakResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| completed_today | boolean | *Example:* `true` | Yes |
| streak | integer | *Example:* `7` | No |

#### models.TextToSpeechRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| language_code | string | *Example:* `"en-US"` | Yes |
| natural | boolean | *Example:* `false` | No |
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

#### models.WebhookResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| received | boolean |  | No |
| type | string |  | No |

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

#### workspaces.Content

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| database_id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |
| id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |
| name | string | *Example:* `"My Content"` | Yes |

#### workspaces.CreateContentRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string |  | Yes |

#### workspaces.CreateContentResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| workspaces.CreateContentResponse | object |  |  |

#### workspaces.CreateDatabaseRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string | *Example:* `"My Database"` | Yes |
| type | [workspaces.DatabaseType](#workspacesdatabasetype) | *Example:* `"content"` | Yes |

#### workspaces.CreateDatabaseResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |

#### workspaces.CreateWorkspaceRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string | *Example:* `"My Workspace"` | Yes |

#### workspaces.CreateWorkspaceResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |

#### workspaces.Database

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |
| name | string | *Example:* `"My Database"` | Yes |
| type | [workspaces.DatabaseType](#workspacesdatabasetype) | *Example:* `"content"` | Yes |
| workspace_id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |

#### workspaces.DatabaseType

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| workspaces.DatabaseType | string |  |  |

#### workspaces.GetWorkspacesResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| workspaces | [ [workspaces.Workspace](#workspacesworkspace) ] |  | Yes |

#### workspaces.QueryDatabaseRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type | [workspaces.DatabaseType](#workspacesdatabasetype) | *Example:* `"content"` | Yes |

#### workspaces.QueryDatabaseResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| content | [ [workspaces.Content](#workspacescontent) ] |  | No |
| id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |
| name | string | *Example:* `"My Database"` | Yes |
| type | [workspaces.DatabaseType](#workspacesdatabasetype) | *Example:* `"content"` | Yes |
| workspace_id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |

#### workspaces.Workspace

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | *Example:* `"xxxx-xxxx-xxxx-xxxx"` | Yes |
| name | string | *Example:* `"My Workspace"` | Yes |

#### workspaces.WorkspacesSummary

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| databases | [ [workspaces.Database](#workspacesdatabase) ] |  | Yes |
| workspaces | [ [workspaces.Workspace](#workspacesworkspace) ] |  | Yes |
