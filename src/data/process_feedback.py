import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
# NLTK is no longer needed for keywords if we use OpenAI for themes
# from nltk.tokenize import word_tokenize
# from nltk.corpus import stopwords
# import nltk
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

# --- Path Definitions ---
# script_dir is the directory where this script (process_feedback.py) is located (e.g., /project_root/src/data)
script_dir = os.path.dirname(os.path.abspath(__file__))
# project_root_path is the root directory of the project (e.g., /project_root)
project_root_path = os.path.abspath(os.path.join(script_dir, "..", ".."))

# --- Environment Variable Loading ---
dotenv_path = os.path.join(project_root_path, '.env.local')
if os.path.exists(dotenv_path):
    print(f"Loading .env file from: {dotenv_path}")
    load_dotenv(dotenv_path=dotenv_path)
else:
    print(f"Warning: .env.local file not found at {dotenv_path}.")
    # Attempt to load from default locations (e.g., if script is run from project root with .env there)
    # This is a fallback and might not always find the intended .env.local if it's not in the root.
    load_dotenv() 

# --- OpenAI API Setup ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found in environment variables.")
    print(f"Please ensure your OPENAI_API_KEY is set in a .env.local file at the project root: {project_root_path}")
    exit(1) # Exit with a non-zero code to indicate failure

try:
    client = OpenAI(api_key=OPENAI_API_KEY)
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    exit(1)

# Commented out NLTK downloads - can be removed if definitely not needed
# nltk.download('punkt')
# nltk.download('stopwords')

# --- Data Loading ---
# Use the new dataset product_feedback_2.csv located at the project root
csv_file_name = 'product_feedback_2.csv'
csv_file_path = os.path.join(project_root_path, csv_file_name)

try:
    df = pd.read_csv(csv_file_path)
except FileNotFoundError:
    print(f"Error: The CSV file '{csv_file_name}' was not found at the expected location: {csv_file_path}")
    exit(1)
except pd.errors.EmptyDataError:
    print(f"Error: The CSV file '{csv_file_name}' is empty at: {csv_file_path}")
    exit(1)
except Exception as e:
    print(f"Error reading CSV file '{csv_file_name}' at {csv_file_path}: {e}")
    exit(1)

# Strip whitespace from column names
df.columns = df.columns.str.strip()

# Initialize sentiment analyzer (VADER)
sentiment_analyzer = SentimentIntensityAnalyzer()

def get_ai_themes(feedback_text, model="gpt-3.5-turbo"):
    """
    Uses OpenAI API to extract high-level themes from feedback text.
    """
    if not feedback_text or not isinstance(feedback_text, str) or feedback_text.strip() == "":
        return ["not applicable"] # Handle empty or invalid feedback text

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert at analyzing customer feedback. Extract 2-3 main themes or topics from the following text. List them as a comma-separated string. For example: 'UI improvement, feature request, bug report'. If no specific themes, return 'general feedback'."},
                {"role": "user", "content": feedback_text}
            ],
            temperature=0.5,
            max_tokens=60 # Increased slightly for potentially longer theme lists or 'general feedback'
        )
        themes_raw = response.choices[0].message.content.strip()
        if not themes_raw or themes_raw.lower() == 'general feedback':
            return ['general feedback']
            
        themes_list = [theme.strip().lower() for theme in themes_raw.split(',') if theme.strip()]
        return themes_list if themes_list else ['general feedback'] # Ensure always returns a list
    except Exception as e:
        print(f"Error calling OpenAI API for feedback \"{feedback_text[:50]}...\": {e}")
        return ["error extracting themes"]

# Process each row
processed_data = []
for index, row in df.iterrows():
    # Ensure required columns exist, provide default if not critical, or raise error
    try:
        text = str(row['feedback_text'])
        source = str(row['source_channel'])
        date_time = str(row['date_time']) # Should ideally be parsed to datetime objects if time-based analysis is complex
        user_id = str(row['user_id'])
        location = str(row['location'])
    except KeyError as e:
        print(f"Error: Missing expected column '{e}' in CSV row {index + 2}. Skipping this row.")
        # print(f"Row data: {row.to_dict()}") # Uncomment for debugging specific row issues
        continue # Skip this row if critical data is missing

    # Confidence Score: Not present in product_feedback_2.csv, so default to 0.0
    # No need to explicitly look for 'Confidence Score' or 'confidence_score' from this specific CSV.
    confidence_score = 0.0

    # Sentiment Analysis (using VADER)
    sentiment_scores = sentiment_analyzer.polarity_scores(text)
    sentiment = "neutral"
    if sentiment_scores['compound'] >= 0.05:
        sentiment = "positive"
    elif sentiment_scores['compound'] <= -0.05:
        sentiment = "negative"

    # AI-driven Theme Extraction
    ai_themes = get_ai_themes(text)

    # Problem/Suggestion Identification
    text_lower = text.lower()
    is_problem = "problem" in text_lower or "issue" in text_lower or "bug" in text_lower or "broken" in text_lower or "doesn't work" in text_lower or sentiment == "negative"
    is_suggestion = "suggest" in text_lower or "idea" in text_lower or "improve" in text_lower or "feature" in text_lower or "enhance" in text_lower or "add" in text_lower or "consider" in text_lower

    processed_data.append({
        "text": text,
        "sentiment": sentiment,
        "ai_themes": ai_themes,
        "is_problem": is_problem,
        "is_suggestion": is_suggestion,
        "source": source,
        "date_time": date_time,
        "user_id": user_id,
        "location": location,
        "confidence_score": confidence_score
    })

# --- Data Saving ---
output_json_filename = 'processed_feedback.json'
public_folder_path = os.path.join(project_root_path, 'public')
output_file_path = os.path.join(public_folder_path, output_json_filename)

try:
    if not os.path.exists(public_folder_path):
        os.makedirs(public_folder_path)
        print(f"Created directory: {public_folder_path}")

    with open(output_file_path, 'w') as f:
        json.dump(processed_data, f, indent=4)
    
    print(f"Successfully processed {len(processed_data)} feedback entries.")
    print(f"Output saved to: {output_file_path}")

except PermissionError:
    print(f"Error: Permission denied when trying to write to {output_file_path}. Please check file/folder permissions.")
    exit(1)
except Exception as e:
    print(f"Error saving processed data to {output_file_path}: {e}")
    exit(1) 