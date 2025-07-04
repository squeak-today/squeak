import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os
import uuid
import sys
import csv
import json
from pathlib import Path

load_dotenv()

# CEFR level descriptions
CEFR_DESCRIPTIONS = {
    'A1': 'Basic vocabulary and phrases for absolute beginners',
    'A2': 'Elementary vocabulary for simple, everyday situations',
    'B1': 'Intermediate vocabulary for everyday interactions',
    'B2': 'Upper intermediate vocabulary for clear, detailed expression',
    'C1': 'Advanced vocabulary for fluent, spontaneous communication',
    'C2': 'Mastery-level vocabulary for complex, nuanced expression'
}

# Placeholder content for language flashcards
# You can either fill this in directly or load from CSV files
LANGUAGE_CONTENT = {
    'Spanish': {
        'A1': [
            {'front': '¡Hola!', 'back': 'Hello!'},
            {'front': '¿Cómo estás?', 'back': 'How are you?'},
            {'front': 'Gracias', 'back': 'Thank you'},
            {'front': 'Por favor', 'back': 'Please'},
            {'front': 'Sí', 'back': 'Yes'},
            {'front': 'No', 'back': 'No'},
            {'front': 'Adiós', 'back': 'Goodbye'},
            {'front': 'Buenos días', 'back': 'Good morning'},
            {'front': 'Buenas tardes', 'back': 'Good afternoon'},
            {'front': 'Buenas noches', 'back': 'Good evening/night'},
            # Add more or replace with your content
        ],
        'A2': [
            {'front': 'El tiempo', 'back': 'The weather'},
            {'front': 'Hace sol', 'back': 'It\'s sunny'},
            {'front': 'Hace frío', 'back': 'It\'s cold'},
            {'front': 'Está lloviendo', 'back': 'It\'s raining'},
            # Add more or replace with your content
        ],
        'B1': [
            # Add your B1 content here
        ],
        'B2': [
            # Add your B2 content here
        ],
        'C1': [
            # Add your C1 content here
        ],
        'C2': [
            # Add your C2 content here
        ],
    },
    'French': {
        'A1': [
            {'front': 'Bonjour', 'back': 'Hello'},
            {'front': 'Comment allez-vous?', 'back': 'How are you?'},
            {'front': 'Merci', 'back': 'Thank you'},
            {'front': 'S\'il vous plaît', 'back': 'Please'},
            {'front': 'Oui', 'back': 'Yes'},
            {'front': 'Non', 'back': 'No'},
            {'front': 'Au revoir', 'back': 'Goodbye'},
            {'front': 'Bon matin', 'back': 'Good morning'},
            {'front': 'Bon après-midi', 'back': 'Good afternoon'},
            {'front': 'Bonsoir', 'back': 'Good evening'},
            # Add more or replace with your content
        ],
        'A2': [
            {'front': 'Le temps', 'back': 'The weather'},
            {'front': 'Il fait beau', 'back': 'It\'s nice weather'},
            {'front': 'Il fait froid', 'back': 'It\'s cold'},
            {'front': 'Il pleut', 'back': 'It\'s raining'},
            # Add more or replace with your content
        ],
        'B1': [
            # Add your B1 content here
        ],
        'B2': [
            # Add your B2 content here
        ],
        'C1': [
            # Add your C1 content here
        ],
        'C2': [
            # Add your C2 content here
        ],
    }
}

def load_from_csv(csv_dir):
    """
    Load flashcard content from CSV files.
    Expected directory structure:
    /csv_dir
        /Spanish
            A1.csv
            A2.csv
            ...
        /French
            A1.csv
            ...
    
    CSV format: front,back
    """
    content = {}
    
    for language_dir in Path(csv_dir).iterdir():
        if language_dir.is_dir():
            language = language_dir.name
            content[language] = {}
            
            for level_file in language_dir.glob("*.csv"):
                level = level_file.stem  # A1, A2, etc.
                content[language][level] = []
                
                with open(level_file, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header if exists
                    
                    for row in reader:
                        if len(row) >= 2:
                            content[language][level].append({
                                'front': row[0],
                                'back': row[1]
                            })
    
    return content

def create_system_decks_and_flashcards(content=None, admin_user_id=None, use_csv=False, csv_dir=None):
    """
    Create system decks and flashcards for language learning
    
    Args:
        content: Dictionary with language content. If None, uses LANGUAGE_CONTENT
        admin_user_id: UUID of admin user. If None, uses env variable
        use_csv: Whether to load content from CSV files
        csv_dir: Directory with CSV files if use_csv is True
    """
    try:
        if use_csv and csv_dir:
            content = load_from_csv(csv_dir)
        elif content is None:
            content = LANGUAGE_CONTENT
            
        # Connect to database
        conn = psycopg2.connect(
            dbname='postgres', 
            user=os.getenv('SUPABASE_DB_USER'), 
            password=os.getenv('SUPABASE_DB_PASSWORD'), 
            host=os.getenv('SUPABASE_DB_HOST'), 
            port=os.getenv('SUPABASE_DB_PORT'),
            sslmode='require'
        )
        
        # Get system user ID
        if admin_user_id:
            system_user_id = admin_user_id
        else:
            system_user_id = os.getenv('ADMIN_USER_ID')
            if not system_user_id:
                print("Error: Admin user ID not provided. Set ADMIN_USER_ID env variable or pass admin_user_id parameter.")
                return False
        
        # Validate system_user_id is a valid UUID
        try:
            uuid_obj = uuid.UUID(system_user_id)
        except ValueError:
            print(f"Error: Invalid UUID format for admin user ID: {system_user_id}")
            return False
            
        print(f"Using admin user ID: {system_user_id}")
        
        deck_records = []
        flashcard_records = []
        deck_id_map = {}  # To track created deck IDs
        
        # Generate deck records
        for language, levels in content.items():
            for level in levels:
                deck_name = f"{language} {level} Vocabulary"
                deck_description = f"{CEFR_DESCRIPTIONS.get(level, 'Language vocabulary')} in {language}"
                
                # Add to deck records
                deck_records.append({
                    "name": deck_name,
                    "description": deck_description,
                    "is_public": True,
                    "is_system": True,
                    "user_id": system_user_id
                })
        
        # Check if we have any decks to create
        if not deck_records:
            print("No deck content found. Please check your input data.")
            return False
            
        print(f"Preparing to create {len(deck_records)} decks...")
        
        # Insert decks and get their IDs
        with conn.cursor() as cur:
            for deck in deck_records:
                # Check if the deck already exists
                cur.execute("""
                    SELECT id FROM decks 
                    WHERE name = %s AND user_id = %s
                """, (deck["name"], deck["user_id"]))
                
                existing_deck = cur.fetchone()
                
                if existing_deck:
                    # Use existing deck
                    deck_id = existing_deck[0]
                    print(f"Using existing deck: {deck['name']} (ID: {deck_id})")
                    
                    # Delete existing flashcards if we're replacing them
                    cur.execute("""
                        DELETE FROM flashcards
                        WHERE deck_id = %s
                    """, (deck_id,))
                else:
                    # Create new deck
                    cur.execute("""
                        INSERT INTO decks (name, description, is_public, is_system, user_id)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id
                    """, (deck["name"], deck["description"], deck["is_public"], 
                          deck["is_system"], deck["user_id"]))
                    
                    deck_id = cur.fetchone()[0]
                    print(f"Created new deck: {deck['name']} (ID: {deck_id})")
                
                deck_id_map[f"{deck['name']}"] = deck_id
        
        # Generate flashcard records
        total_flashcards = 0
        for language, levels in content.items():
            for level, cards in levels.items():
                deck_name = f"{language} {level} Vocabulary"
                deck_id = deck_id_map.get(deck_name)
                
                if not deck_id:
                    print(f"Warning: Could not find deck_id for {deck_name}")
                    continue
                    
                level_flashcards = []
                for card in cards:
                    # Explicitly include source_url with empty string to avoid NULL values
                    level_flashcards.append((
                        deck_id,
                        card["front"],
                        card["back"],
                        ""  # Empty string for source_url instead of NULL
                    ))
                
                # Insert flashcards in batches
                if level_flashcards:
                    with conn.cursor() as cur:
                        execute_values(
                            cur,
                            """
                            INSERT INTO flashcards (deck_id, front_content, back_content, source_url)
                            VALUES %s
                            """,
                            level_flashcards
                        )
                    total_flashcards += len(level_flashcards)
                    print(f"Added {len(level_flashcards)} flashcards to {deck_name}")
        
        conn.commit()
        print(f"\n✅ Successfully created/updated {len(deck_records)} decks and added {total_flashcards} flashcards")
        return True
        
    except Exception as e:
        print(f"Error creating system decks and flashcards: {e}")
        return False
    finally:
        if conn:
            conn.close()

def export_template_csv():
    """
    Export template CSV files for each language and level
    """
    output_dir = Path("language_csv_templates")
    output_dir.mkdir(exist_ok=True)
    
    for language in LANGUAGE_CONTENT:
        language_dir = output_dir / language
        language_dir.mkdir(exist_ok=True)
        
        for level in CEFR_DESCRIPTIONS:
            csv_path = language_dir / f"{level}.csv"
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["front", "back"])
                
                # Add sample content if available
                if level in LANGUAGE_CONTENT[language]:
                    for card in LANGUAGE_CONTENT[language][level]:
                        writer.writerow([card["front"], card["back"]])
    
    print(f"CSV templates exported to {output_dir.absolute()}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Import language flashcards to Supabase')
    parser.add_argument('--admin-id', help='Admin user ID to assign as owner of system decks')
    parser.add_argument('--csv', action='store_true', help='Load content from CSV files')
    parser.add_argument('--csv-dir', help='Directory containing CSV files (if using --csv)')
    parser.add_argument('--export-templates', action='store_true', help='Export template CSV files and exit')
    
    args = parser.parse_args()
    
    if args.export_templates:
        export_template_csv()
        return
    
    if args.csv and not args.csv_dir:
        print("Error: --csv-dir is required when using --csv")
        return
    
    create_system_decks_and_flashcards(
        admin_user_id=args.admin_id,
        use_csv=args.csv,
        csv_dir=args.csv_dir
    )

if __name__ == "__main__":
    main()