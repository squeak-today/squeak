import os
import sys
import boto3
from pathlib import Path
import argparse

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

def validate_story_folder(folder_path):
    # check if folder exists
    path = Path(folder_path)
    if not path.exists():
        raise ValueError(f"Story folder {folder_path} does not exist")
    
    if not (path / "context.txt").exists():
        raise ValueError(f"Missing context.txt in {folder_path}")
    
    # check if there are page files
    page_files = list(path.glob("page*.mdx"))
    if not page_files:
        raise ValueError(f"No page*.mdx files found in {folder_path}")
    
    return sorted(page_files)

def get_story_id(folder_name):
    """Convert folder name like '001' to numeric ID '1'"""
    try:
        return str(int(folder_name))  # This will strip leading zeros
    except ValueError:
        raise ValueError(f"Folder name {folder_name} must be numeric")

def upload_story(folder_path, language, cefr, topic, bucket_name):
    """Upload all story files to S3."""
    s3 = boto3.client('s3')
    
    folder_path = Path(folder_path)
    story_id = get_story_id(folder_path.name)
    
    # Upload context file
    context_path = folder_path / "context.txt"
    s3_context_key = f"{language.lower()}/{cefr.upper()}/{topic.title()}/Story/{story_id}/context.txt"
    
    print(f"Uploading context file to {s3_context_key}")
    with open(context_path, 'rb') as f:
        s3.upload_fileobj(f, bucket_name, s3_context_key)
    
    # upload all page files
    page_files = validate_story_folder(folder_path)
    for page_file in page_files:
        if page_file == 'preview':
            continue
        page_num = int(page_file.stem.replace('page', ''))
        s3_page_key = f"{language.lower()}/{cefr.upper()}/{topic.title()}/Story/{story_id}/page{page_num}.mdx"
        
        print(f"Uploading {page_file.name} to {s3_page_key}")
        with open(page_file, 'rb') as f:
            s3.upload_fileobj(f, bucket_name, s3_page_key)

def upload_story_sql(conn, folder_name, title, language, cefr, topic, preview):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO stories (id, title, language, topic, cefr_level, preview_text)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (int(folder_name), title, language.title(), topic, cefr, preview)
        )
    conn.commit()

def read_preview(folder):
    with open(f"{folder}/preview", 'r') as f:
        return f.read()

def main():
    parser = argparse.ArgumentParser(description='Upload a story folder to S3')
    parser.add_argument('folder', help='Path to the story folder (e.g., "001")')
    parser.add_argument('--language', required=True, help='Language of the story (e.g., "french")')
    parser.add_argument('--title', required=True, help='Title of the story (e.g "My First French Words")')
    parser.add_argument('--cefr', required=True, help='CEFR level (e.g., "A1")')
    parser.add_argument('--topic', required=True, help='Topic/subject of the story')
    parser.add_argument('--bucket', required=True, help='S3 bucket name')
    
    args = parser.parse_args()

    try:
        preview = read_preview(args.folder)
        conn = psycopg2.connect(
            dbname='postgres', 
            user=os.getenv('SUPABASE_DB_USER'), 
            password=os.getenv('SUPABASE_DB_PASSWORD'), 
            host=os.getenv('SUPABASE_DB_HOST'), 
            port=os.getenv('SUPABASE_DB_PORT'),
            sslmode='require'
        )
        upload_story(
            args.folder,
            args.language,
            args.cefr,
            args.topic,
            args.bucket
        )
        upload_story_sql(
            conn,
            args.folder,
            args.title,
            args.language,
            args.cefr,
            args.topic,
            preview
        )
        print("Story uploaded successfully!")
        conn.close()
    except Exception as e:
        print(f"Error uploading story: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
