import sys
import os
import json
import requests
import argparse
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()


ELEVENLABS_FRENCH_VOICE_ID = "Ndm6bI6wo3Ycnlx1PPZS" # Luca
ELEVENLABS_SPANISH_VOICE_ID = "rEVYTKPqwSMhytFPayIb" # Sandra

def generate_tts(text: str, language: str):
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY not set.")
    voice_id = ELEVENLABS_FRENCH_VOICE_ID
    match language:
        case "Spanish":
            voice_id = ELEVENLABS_SPANISH_VOICE_ID

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps"
    payload = {
        "text": text,
        "model_id": "eleven_flash_v2_5"
    }
    
    headers = {
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise Exception(f"ElevenLabs API err: {response.status_code} - {response.text}")
    return response.json()


def validate_audiobook_folder(folder_path):
    path = Path(folder_path)
    if not path.exists():
        raise ValueError(f"Audiobook folder {folder_path} does not exist")
    
    page_files = list(path.glob("page*.md"))
    if not page_files:
        raise ValueError(f"No page*.md files found in {folder_path}")
    
    return sorted(page_files)

def generate_audiobook_files(folder_path: str, language: str):
    page_files = validate_audiobook_folder(folder_path)
    total_pages = len(page_files)

    for i,page in enumerate(page_files):
        with open(page, 'r') as f:
            content = f.read()
            resp = generate_tts(content, language)
            resp["text"] = content
            resp["pages"] = total_pages

            with open(f"{folder_path}/page{i}.json", 'w') as nf:
                json.dump(resp, nf, ensure_ascii=False, indent=2)
            print(f"Created audiobook JSON for page {i}")

def main():
    parser = argparse.ArgumentParser(description='Optionally generate then upload an audiobook.')
    parser.add_argument('folder', help='Path to the folder, (e.g "001")')
    parser.add_argument('--language', required=True, help='Language of the story (e.g., "French")')
    args = parser.parse_args()

    try:
        generate_audiobook_files(args.folder, args.language)
        print("Audiobook data generated successfully!")
    except Exception as e:
        print(f"Error uploading audiobook: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
