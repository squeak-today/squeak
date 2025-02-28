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
- As a lambda, `/api`
- Two other lambda functions, `/queue_filler` and `/lambda`

### Prerequisites
- Python 3.11.11
- Node.js 18.20.5
- NPX 10.8.2
- Golang 1.23.4
- Terraform CLI

And for credentials:
- AWS Credentials (at `~/.aws/credentials`)
- API keys (see later `.env` files)
- Supabase Access
- Supabase CLI [optional]

Also, make sure you're on your own branch.

### `/api`
Contains the Go implementation and code for the backend lambda API.
The API follows the OpenAPI spec, and annotations for each handler are in `/handlers`.
High level overview:
- `/docs` Contains auto generated code and spec files by swagger
- `/handlers` Implementations for the endpoints
- `/models` Type declarations for errors and API responses (the types are used in the swagger annotations)
- `main.go`
- and then other modules as helpers, e.g `supabase`

Install swaggo with:
```shell
go install github.com/swaggo/swag/cmd/swag@latest
npm install swagger-markdown
npm install api-spec-converter
```
This installs `swag` as a
You can then run:
```shell
./gen-swagger.sh
```

A better UI other than the genrated docs can also be generated through `https://editor.swagger.io/`.

Checklist for adding new endpoints
- [ ] Swagger annotations
- [ ] Define request body types (for POST) and response body types in models
- [ ] Use types in handler itself on binding

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