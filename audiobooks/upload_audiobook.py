from dotenv import load_dotenv
import psycopg2
import os
import sys
import boto3
import argparse
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

def upload_audiobook_sql(conn, type: str, folder_name: str, tier, pages, date):
    id = get_audiobook_id(folder_name)
    query = f"INSERT INTO audiobooks ({type.lower()}_id, tier, pages, created_at) VALUES (%s, %s, %s, %s)"

    with conn.cursor() as cur:
        cur.execute(
            query,
            (id, tier, pages, date)
        )
    conn.commit()

def upload_audiobook(folder_path, type, language, cefr, topic, date):
    s3 = boto3.client('s3')
    folder_path = Path(folder_path)

    page_files = validate_audiobook_folder(folder_path)
    print(f"Upload {len(page_files)} files.")
    for page_file in page_files:
        page_num = int(page_file.stem.replace('page', ''))
        s3_page_key = f"{language.lower()}/{cefr.upper()}/{topic.title()}/{type.title()}/audiobook_{page_num}_{cefr.upper()}_{type.title()}_{topic.title()}_{date}.json"

        print(f"Uploading {page_file.name} to {s3_page_key}")
        with open(page_file, 'rb') as f:
            s3.upload_fileobj(f, os.getenv('S3_BUCKET_NAME'), s3_page_key)
    

def validate_audiobook_folder(folder_path):
    path = Path(folder_path)
    if not path.exists():
        raise ValueError(f"Audiobook folder {folder_path} does not exist")
    
    page_files = list(path.glob("page*.json"))
    if not page_files:
        raise ValueError(f"No page*.json files found in {folder_path}")
    
    return sorted(page_files)

def get_audiobook_id(folder_name):
    try:
        return str(int(folder_name))
    except ValueError:
        raise ValueError(f"Folder name {folder_name} must be numeric")

def main():
    parser = argparse.ArgumentParser(description='Optionally generate then upload an audiobook.')
    parser.add_argument('folder', help='Path to the folder, (e.g "001")')
    parser.add_argument('--type', required=True, help='Content Type, either "Story" or "News"')
    parser.add_argument('--id', required=True,help='Story or News ID.')
    parser.add_argument('--tier', required=True, help='FREE, BASIC, PREMIUM')
    parser.add_argument('--pages', required=True, help='Total number of pages')
    parser.add_argument('--language', required=True, help='Language of the story (e.g., "french")')
    parser.add_argument('--cefr', required=True, help='CEFR level (e.g., "A1")')
    parser.add_argument('--topic', required=True, help='Topic/subject of the story')
    parser.add_argument('--date', required=True, help='Upload date, as YYYY-MM-DD.')
    args = parser.parse_args()

    try:
        page_files = validate_audiobook_folder(args.folder)
        if len(page_files) != int(args.pages):
            raise ValueError(f"Amount of pages in specified folder does not match --pages flag.")
        conn = psycopg2.connect(
            dbname='postgres', 
            user=os.getenv('SUPABASE_DB_USER'), 
            password=os.getenv('SUPABASE_DB_PASSWORD'), 
            host=os.getenv('SUPABASE_DB_HOST'), 
            port=os.getenv('SUPABASE_DB_PORT'),
            sslmode='require'
        )
        upload_audiobook(args.folder, args.type, args.language, args.cefr, args.topic, args.date)
        upload_audiobook_sql(conn, args.type, args.folder, args.tier, args.pages, args.date)
        print("Audiobook uploaded successfully!")
        conn.close()
    except Exception as e:
        print(f"Error uploading audiobook: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
