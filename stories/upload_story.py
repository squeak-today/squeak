import os
import sys
import boto3
from pathlib import Path
import argparse

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

def upload_story(folder_path, language, cefr, topic, bucket_name):
    """Upload all story files to S3."""
    s3 = boto3.client('s3')
    
    folder_path = Path(folder_path)
    story_id = folder_path.name
    
    # Upload context file
    context_path = folder_path / "context.txt"
    s3_context_key = f"{language.lower()}/{cefr.upper()}/{topic.title()}/Story/{story_id}/context.txt"
    
    print(f"Uploading context file to {s3_context_key}")
    with open(context_path, 'rb') as f:
        s3.upload_fileobj(f, bucket_name, s3_context_key)
    
    # upload all page files
    page_files = validate_story_folder(folder_path)
    for page_file in page_files:
        page_num = int(page_file.stem.replace('page', ''))
        s3_page_key = f"{language.lower()}/{cefr.upper()}/{topic.title()}/Story/{story_id}/page{page_num}.mdx"
        
        print(f"Uploading {page_file.name} to {s3_page_key}")
        with open(page_file, 'rb') as f:
            s3.upload_fileobj(f, bucket_name, s3_page_key)

def main():
    parser = argparse.ArgumentParser(description='Upload a story folder to S3')
    parser.add_argument('folder', help='Path to the story folder (e.g., "001")')
    parser.add_argument('--language', required=True, help='Language of the story (e.g., "french")')
    parser.add_argument('--cefr', required=True, help='CEFR level (e.g., "A1")')
    parser.add_argument('--topic', required=True, help='Topic/subject of the story')
    parser.add_argument('--bucket', required=True, help='S3 bucket name')
    
    args = parser.parse_args()
    
    try:
        upload_story(
            args.folder,
            args.language,
            args.cefr,
            args.topic,
            args.bucket
        )
        print("Story uploaded successfully!")
    except Exception as e:
        print(f"Error uploading story: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()