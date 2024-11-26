In order to test using the `api.squeak.today` endpoint, a new CNAME record needs to be created on each instantiation
of the REST API Gateway.

1. `terraform apply`.
2. Go to API Gateway -> Custom domain names -> api.squeak.today
Under `Endpoint Configuration`, see the `API Gateway domain name`. This is used in step 3.
 -> API Mappings
Create a new mapping for the API just deployed, Stage=dev and path blank.
3. In Route 53, under `squeak.today`, create a CNAME record **IF IT DOES NOT EXIST ALREADY, CHECK**:
Name: api.squeak.today
Value: d-xxxxxx.execute-api.us-east-2.amazonaws.com
TTL: 60

API is now callable with GET `https://api.squeak.today/news?language=French&cefr=B2&subject=Politics`
or GET `https://api.squeak.today/story?language=French&cefr=B2&subject=Politics`

**DELETE API MAPPING AFTERWARDS IF YOU CALL** `terraform destroy`.
