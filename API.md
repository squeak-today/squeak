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

---
### Models

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

#### models.ErrorResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| error | string | *Example:* `"error message"` | No |

#### models.GetClassroomInfoResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| classroom_id | string | *Example:* `"123"` | No |
| students_count | integer | *Example:* `10` | No |

#### models.TeacherStatusResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| exists | boolean | *Example:* `true` | No |
