import boto3
import json
from datetime import datetime, timedelta
import itertools
from pathlib import Path
import argparse
import random
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

load_dotenv()

CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
LANGUAGES = ['french', 'spanish']
TOPICS = [
    'Politics',
    'Business',
    'Technology',
    'Finance',
    'Gaming',
    'Music',
    'Film and TV',
    'NBA',
    'NFL',
    'Football'
]

DUMMY_NEWS_SOURCES = [
    'Bleacher Report',
    'The Associated Press',
    'ESPN',
    'Reuters',
    'Sporting News',
    'Deadspin',
    'The Athletic',
    'Sports Illustrated'
]

def generate_dates(num_days=3):
    today = datetime.now()
    return [(today - timedelta(days=x)).strftime("%Y-%m-%d") for x in range(num_days)]

def generate_dummy_sources(topic):
    num_sources = random.randint(10, 20)
    sources = []
    
    for _ in range(num_sources):
        source = {
            "title": f"{random.choice(DUMMY_NEWS_SOURCES)}: {topic} news and updates",
            "url": f"https://{random.choice(['www', 'sports', 'news'])}.{random.choice(['example.com', 'newssite.com', 'sportsnews.com'])}/article/{random.randint(10000, 99999)}",
            "content": "TOP NEWS " + " ".join([
                f"{topic} update {i}: " + "Lorem ipsum dolor sit amet. " * random.randint(1, 3)
                for i in range(random.randint(3, 6))
            ]),
            "score": random.uniform(0.35, 0.5)
        }
        sources.append(source)
    
    return sorted(sources, key=lambda x: x['score'], reverse=True)

def create_dummy_article(cefr, topic, date):
    title = f"{topic} News for {cefr} Level - {date}"
    preview = f"This is a preview of the dummy article about {topic}, written at {cefr} level."
    
    return {
        "article": f"""# {title}

## Main Story

This is a dummy article for testing purposes. It's written at {cefr} level about {topic}.

### Key Points

- First important point about {topic}
- Second important point
- Third important point

The actual content would be much longer and more detailed, appropriate for {cefr} level readers.
""",
        "dictionary": {
            "translations": {
                "words": {},
                "sentences": {}
            }
        },
        "sources": generate_dummy_sources(topic)
    }

def upload_dummy_data(bucket_name, db_conn):
    s3 = boto3.client('s3')
    dates = generate_dates(3)
    
    combinations = list(itertools.product(LANGUAGES, CEFR_LEVELS, TOPICS, dates))
    total = len(combinations)
    
    print(f"Preparing to upload {total} dummy articles...")
    
    news_records = []
    
    for i, (language, cefr, topic, date) in enumerate(combinations, 1):
        article = create_dummy_article(cefr, topic, date)
        
        title = f"{topic} News for {cefr} Level - {date}"
        preview = f"This is a preview of the dummy article about {topic}, written at {cefr} level."
        
        filename = f"{cefr}_News_{topic}_{date}.json"
        s3_key = f"{language.lower()}/{cefr.upper()}/{topic}/News/{filename}"
        
        print(f"[{i}/{total}] Uploading {s3_key} to S3")
        s3.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=json.dumps(article, ensure_ascii=False),
            ContentType='application/json'
        )
        
        news_records.append((
            title,
            language.capitalize(),
            topic,
            cefr.upper(),
            preview,
            date
        ))
    
    print("Inserting records into database...")
    with db_conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO news (title, language, topic, cefr_level, preview_text, date_created)
            VALUES %s
            ON CONFLICT (topic, language, cefr_level, date_created) DO NOTHING
            """,
            news_records
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
        print("\n✅ Successfully uploaded all dummy news articles!")
        
        conn.close()
    except Exception as e:
        print(f"Error uploading dummy data: {e}")
        exit(1)

if __name__ == "__main__":
    main()