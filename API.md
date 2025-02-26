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
| content_id | integer | *Example:* `123` | Yes |
| content_type | string | *Example:* `"News"` | Yes |

#### models.AcceptContentResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string | *Example:* `"Content accepted successfully"` | Yes |

#### models.AudioHealthResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| status | string | *Example:* `"live"` | No |

#### models.ClassroomContentItem

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cefr_level | string | *Example:* `"B1"` | Yes |
| content_type | string | *Example:* `"News"` | No |
| created_at | string | *Example:* `"2025-02-26T13:01:13.390612Z"` | Yes |
| date_created | string | *Example:* `"2025-02-26"` | Yes |
| id | string | *Example:* `"2479"` | Yes |
| language | string | *Example:* `"French"` | Yes |
| pages | integer | *Example:* `10` | No |
| preview_text | string | *Example:* `"# L'actualité musicale en bref\n\n## Un flot de nouveautés..."` | Yes |
| title | string | *Example:* `"# L'actualité musicale en bref\n\n## Un fl..."` | Yes |
| topic | string | *Example:* `"Music"` | Yes |

#### models.CreateClassroomRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| students_count | integer | *Example:* `10` | Yes |

#### models.CreateClassroomResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | Yes |

#### models.ErrorResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | string | *Example:* `"PROFILE_NOT_FOUND"` | No |
| error | string | *Example:* `"Something went wrong"` | Yes |

#### models.GetClassroomInfoResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | No |
| students_count | integer | *Example:* `10` | No |

#### models.GetProfileResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| daily_questions_goal | integer | *Example:* `3` | Yes |
| interested_topics | [ string ] | *Example:* `["[\"NBA\"]"]` | Yes |
| learning_language | string | *Example:* `"French"` | Yes |
| skill_level | string | *Example:* `"B1"` | Yes |
| username | string | *Example:* `"connortbot"` | Yes |

#### models.GetStudentClassroomResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| students_count | integer | *Example:* `10` | Yes |
| teacher_id | string | *Example:* `"789"` | Yes |

#### models.IncrementProgressResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| date | string | *Example:* `"2025-02-26T00:00:00Z"` | Yes |
| goal_met | boolean | *Example:* `true` | Yes |
| questions_completed | integer | *Example:* `5` | Yes |
| user_id | string | *Example:* `"123"` | Yes |

#### models.JoinClassroomRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | Yes |

#### models.JoinClassroomResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string | *Example:* `"Student added to classroom successfully"` | Yes |

#### models.RejectContentRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| content_id | integer | *Example:* `123` | Yes |
| content_type | string | *Example:* `"News"` | Yes |

#### models.RejectContentResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| message | string | *Example:* `"Content rejected successfully"` | Yes |

#### models.StreakResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| completed_today | boolean | *Example:* `true` | Yes |
| streak | integer | *Example:* `7` | Yes |

#### models.StudentStatusResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"456"` | Yes |
| student_id | string | *Example:* `"123"` | Yes |

#### models.TeacherStatusResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| exists | boolean | *Example:* `true` | No |

#### models.TextToSpeechRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| language_code | string | *Example:* `"en-US"` | Yes |
| text | string | *Example:* `"Hello, how are you?"` | Yes |
| voice_name | string | *Example:* `"en-US-Standard-A"` | Yes |

#### models.TextToSpeechResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| audio_content | string | *Example:* `"base64-encoded-audio-content"` | No |

#### models.TodayProgressResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| date | string | *Example:* `"2025-02-26T00:00:00Z"` | Yes |
| goal_met | boolean | *Example:* `true` | Yes |
| questions_completed | integer | *Example:* `5` | Yes |
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
| daily_questions_goal | integer | *Example:* `3` | Yes |
| interested_topics | [ string ] | *Example:* `["[\"NBA\"]"]` | Yes |
| learning_language | string | *Example:* `"French"` | Yes |
| skill_level | string | *Example:* `"B1"` | Yes |
| username | string | *Example:* `"johndoe"` | Yes |

#### models.UpsertProfileResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer | *Example:* `123` | Yes |
| message | string | *Example:* `"Profile updated successfully"` | Yes |
