import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
# NLTK is no longer needed for keywords if we use OpenAI for themes
# from nltk.tokenize import word_tokenize
# from nltk.corpus import stopwords
# import nltk
import json
import os # Added for environment variables
from openai import OpenAI # Added for OpenAI API
from dotenv import load_dotenv # Added to load .env.local

# Load environment variables from .env.local (especially OPENAI_API_KEY)
# Construct the path to .env.local relative to this script's directory or assuming script is run from project root.
# More robust: Get script's directory and go up to project root.
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir) # Assumes src is one level down from root
dotenv_path = os.path.join(project_root, '.env.local')

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
else:
    # Fallback for cases where the script might be run directly from the project root
    # or if the above path calculation is off for some reason.
    load_dotenv() # Try default loading if specific path not found
    # Attempt to load from current working directory if specific path fails
    # This is a bit of a belt-and-suspenders approach
    if not os.getenv("OPENAI_API_KEY"):
        load_dotenv(os.path.join(os.getcwd(), '.env.local'))

# --- OpenAI API Setup ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found after attempting to load .env file.")
    print("Please ensure your OPENAI_API_KEY is set in your .env.local file and the file is in the project root.")
    exit()

try:
    client = OpenAI(api_key=OPENAI_API_KEY) # Explicitly pass the API key
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    exit()

# Download NLTK data - only for stopwords if still used for something else
# For now, we'll rely on OpenAI for themes, so punkt and stopwords might not be strictly necessary
# but VADER might still use some NLTK resources implicitly or for other potential text processing.
# nltk.download('punkt')
# nltk.download('stopwords')

# Load the dataset
df = pd.read_csv('src/data/sentiment-analysis.csv')

# Strip whitespace from column names
df.columns = df.columns.str.strip()

# Print the first few rows to debug (optional)
# print("First few rows of the dataset:")
# print(df.head())

# Initialize sentiment analyzer (VADER)
sentiment_analyzer = SentimentIntensityAnalyzer()
# stop_words = set(stopwords.words('english')) # Only needed if doing separate keyword extraction

def get_ai_themes(feedback_text, model="gpt-3.5-turbo"):
    """
    Uses OpenAI API to extract high-level themes from feedback text.
    For MVP, we'll send each piece of feedback individually.
    For optimization later, we could batch these.
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert at analyzing customer feedback. Extract 2-3 main themes or topics from the following text. List them as a comma-separated string. For example: 'UI improvement, feature request, bug report'."},
                {"role": "user", "content": feedback_text}
            ],
            temperature=0.5, # Lower temperature for more deterministic themes
            max_tokens=50
        )
        themes_raw = response.choices[0].message.content.strip()
        # Split by comma, strip whitespace, and convert to lowercase
        themes_list = [theme.strip().lower() for theme in themes_raw.split(',') if theme.strip()]
        return themes_list
    except Exception as e:
        print(f"Error calling OpenAI API for feedback \"{feedback_text[:50]}...\": {e}") # Log part of the problematic feedback
        return ["error extracting themes"] # Return a default or error indicator (lowercase)

# Process each row
processed_data = []
for index, row in df.iterrows():
    text = str(row['Text']) # Ensure text is string
    source = row['Source']
    date_time = row['Date/Time']
    user_id = row['User ID']
    location = row['Location']
    # Ensure confidence_score is float, handle potential errors
    try:
        confidence_score = float(row['Confidence Score'])
    except ValueError:
        confidence_score = 0.0 # Default or error value

    # Sentiment Analysis (using VADER)
    sentiment_scores = sentiment_analyzer.polarity_scores(text)
    sentiment = "neutral"
    if sentiment_scores['compound'] >= 0.05:
        sentiment = "positive"
    elif sentiment_scores['compound'] <= -0.05:
        sentiment = "negative"

    # AI-driven Theme Extraction
    ai_themes = get_ai_themes(text) # Using "gpt-3.5-turbo" by default

    # Basic Keyword Extraction (can be kept as a fallback or supplement)
    # For MVP, focusing on AI themes, so we can simplify or remove this if desired.
    # simple_keywords = [word.strip('.,!?\"').lower() for word in text.split() if word.isalnum() and word.lower() not in stop_words]

    # Problem/Suggestion Identification (Simple Heuristics - can be improved with AI)
    is_problem = "problem" in text.lower() or "issue" in text.lower() or "bug" in text.lower() or sentiment == "negative"
    is_suggestion = "suggest" in text.lower() or "idea" in text.lower() or "improve" in text.lower() or "feature" in text.lower()

    processed_data.append({
        "text": text,
        "sentiment": sentiment,
        "ai_themes": ai_themes, # Changed from "keywords" to "ai_themes"
        # "keywords": simple_keywords, # Can keep or remove
        "is_problem": is_problem,
        "is_suggestion": is_suggestion,
        "source": source,
        "date_time": date_time,
        "user_id": user_id,
        "location": location,
        "confidence_score": confidence_score
    })

# Save the processed data
with open('src/data/processed_feedback.json', 'w') as f:
    json.dump(processed_data, f, indent=4)

print("Successfully processed feedback with AI theme extraction and saved to src/data/processed_feedback.json") 