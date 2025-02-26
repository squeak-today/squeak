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

---
### Models

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
