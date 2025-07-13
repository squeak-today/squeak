package processor

import (
	"context"
	"log"
	"time"

	"snout/storage"
	"snout/supabase"
	"snout/supabase/workspaces"
	types "snout/whisker_types"
)

type ContentProcessor struct {
	supabaseClient *supabase.Client
	s3Client       *storage.S3Client
}

func NewContentProcessor(supabaseClient *supabase.Client, s3Client *storage.S3Client) *ContentProcessor {
	return &ContentProcessor{
		supabaseClient: supabaseClient,
		s3Client:       s3Client,
	}
}

func (p *ContentProcessor) Process(ctx context.Context, job *types.ContentJobRecord) error {
	select {
	case <-time.After(5 * time.Second):
	case <-ctx.Done():
		log.Printf("Content job cancelled for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
		return ctx.Err()
	}

	content := types.StoredContent{
		Name: job.Job.Name,
		Markdown: `# Welcome to the Language Learning Demo

## English Section
This is a demonstration of *various* **markdown** features.

### Lists and Code
Here's an unordered list:
- First item with some *italics*
- Second item with some **bold text**
- Third item with ***bold italics***
- Fourth item with **bold** and **bold again** and **bold**.
- Fifth item with **bold** **bold**, to **check** spacing.
- Sixth item to see if it happens *with* italic.

And an ordered list:
1. Step one
2. Step two
3. Step three

#### Code Example
Here's a code block:
` + "```python" + `
def hello_world():
    print("Hello, learner!")
` + "```" + `

## Sección en Español
¡Bienvenidos a la sección española! Aquí hay algunas frases útiles:
- Buenos días
- ¿Cómo estás?
- Mucho gusto en conocerte

### Práctica
Vamos a practicar un poco con estas oraciones simples.

## Section Française
Bienvenue à la section française! Voici quelques phrases utiles:
- Bonjour tout le monde
- Comment allez-vous?
- Enchanté de vous rencontrer

### Pratique
Pratiquons avec ces phrases simples.

##### Final Notes
> This is a blockquote to demonstrate more markdown features

###### Technical Details
You can find more information in the documentation.`,
	}

	select {
	case <-time.After(5 * time.Second):
	case <-ctx.Done():
		return ctx.Err()
	}

	contentId, err := workspaces.CreateContent(
		ctx,
		p.supabaseClient,
		job.Job.DatabaseID,
		job.Job.Name,
		job.Job.LanguageCode,
		job.Job.CEFRLevel,
	)
	if err != nil {
		log.Printf("Failed to create content: %v", err)
		return err
	}
	log.Printf("Storing content for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
	if err := p.s3Client.PutContent(ctx, job.Job.UserID, contentId, content); err != nil {
		log.Printf("Failed to store content: %v", err)
		return err
	}

	log.Printf("Processed content job for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
	return nil
}
