# Squeak Story Generation and REST API Backend

1. Build Go binaries with `./build-for-lambda.sh` which compiles, zips, and places in `infrastructure/`.
2. Create `terraform.tfvars` with the following format:
```
cohere_api_key = "cohere-key-here"
google_api_key = "google-key-here"
tavily_api_key = "tvly-key-here"
```
3. `cd infrastructure`, call:
```
terraform init
terraform apply
```
and later:
```
terraform destroy
```
4. Either wait for S3 to be populated after the story generation lambda is invoked or invoke manually. The REST API endpoint should be ready for use.

## **GET** `/story`
```
https://api.squeak.today/story
```
Pulls generated story data as JSON. Pass `language`, `cefr`, and `subject` as fields.

### Path Parameters

**language** `string` (*required*)

Current supported languages are `French`.

---

**cefr** `string` (*required*)

Must be one of `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.

---

**subject** `string` (*required*)

### Response
`200 Successful`
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


## **GET** `/news`
```
https://api.squeak.today/news
```
Pulls generated news article data as JSON. Pass `language`, `cefr`, and `subject` as fields.

### Path Parameters

**language** `string` (*required*)

Current supported languages are `French`.

---

**cefr** `string` (*required*)

Must be one of `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.

---

**subject** `string` (*required*)

### Response
`200 Successful`
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

## Examples: `api.squeak.today`
```
https://api.squeak.today/news?language=French&cefr=B2&subject=Politics

https://api.squeak.today/story?language=French&cefr=B2&subject=Politics
```

Or, equivalently:
```
https://<api-id>.execute-api.us-east-2.amazonaws.com/dev/news?language=French&cefr=B2&subject=Politics

https://<api-id>.execute-api.us-east-2.amazonaws.com/dev/story?language=French&cefr=B2&subject=Politics
```