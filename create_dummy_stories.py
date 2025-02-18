import boto3
import json
from datetime import datetime, timedelta
import itertools
import random
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

load_dotenv()

CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
LANGUAGES = ['french', 'spanish']
TOPICS = [
    'Beginner',
    'Food',
    'Travel'
]

def generate_dates(num_days=3):
    today = datetime.now()
    return [(today - timedelta(days=x)).strftime("%Y-%m-%d") for x in range(num_days)]

def create_dummy_story_content(story_id, cefr, topic):
    context = f"This is a sample story about {topic} for {cefr} level learners. Story ID: {story_id}"
    
    num_pages = random.randint(3, 5)
    pages = []
    
    for page_num in range(num_pages):
        content = f"""# {topic} Story - Page {page_num + 1}

This is page {page_num + 1} of our story about {topic}.

<QuickTipWidget>
    Here's a helpful tip for {cefr} level learners!
</QuickTipWidget>

The story continues with more {topic}-related content...

<QuizInputWidget question="What did you learn from this page?" correctAnswer="something about {topic}" />
"""
        pages.append(content)
    
    return {
        "context": context,
        "pages": pages,
        "num_pages": num_pages
    }

def upload_dummy_data(bucket_name, db_conn):
    s3 = boto3.client('s3')
    dates = generate_dates()
    
    combinations = list(itertools.product(LANGUAGES, CEFR_LEVELS, TOPICS, dates))
    total = len(combinations)
    
    print(f"Preparing to upload {total} dummy stories...")
    
    story_records = []
    
    for i, (language, cefr, topic, date) in enumerate(combinations, 1):
        story_id = str(i)
        
        story = create_dummy_story_content(story_id, cefr, topic)
        
        title = f"{topic} Story for {cefr} Level - {date}"
        preview = f"A story about {topic} for {cefr} level learners"
        
        context_key = f"{language.lower()}/{cefr.upper()}/{topic}/Story/{story_id}/context.txt"
        print(f"[{i}/{total}] Uploading {context_key}")
        s3.put_object(
            Bucket=bucket_name,
            Key=context_key,
            Body=story["context"],
            ContentType='text/plain'
        )
        
        for page_num, page_content in enumerate(story["pages"]):
            page_key = f"{language.lower()}/{cefr.upper()}/{topic}/Story/{story_id}/page{page_num}.mdx"
            print(f"[{i}/{total}] Uploading {page_key}")
            s3.put_object(
                Bucket=bucket_name,
                Key=page_key,
                Body=page_content,
                ContentType='text/markdown'
            )
        
        story_records.append((
            title,
            language.capitalize(),
            topic,
            cefr.upper(),
            preview,
            date,
            story["num_pages"]
        ))
    
    print("Inserting records into database...")
    with db_conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO stories (title, language, topic, cefr_level, preview_text, date_created, pages)
            VALUES %s
            """,
            story_records
        )
    db_conn.commit()

def main():
    try:
        bucket_name = os.getenv('S3_BUCKET_NAME')

        if not bucket_name:
            raise ValueError("Missing required environment variables. Please check your .env file")

        conn = psycopg2.connect(
            dbname='postgres', 
            user=os.getenv('SUPABASE_DB_USER'), 
            password=os.getenv('SUPABASE_DB_PASSWORD'), 
            host=os.getenv('SUPABASE_DB_HOST'),
            port=os.getenv('SUPABASE_DB_PORT'),
            sslmode='require'
        )
        
        upload_dummy_data(bucket_name, conn)
        print("\n✅ Successfully uploaded all dummy stories!")
        
        conn.close()
    except Exception as e:
        print(f"Error uploading dummy data: {e}")
        exit(1)

if __name__ == "__main__":
    main()