import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import json

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Load the dataset
df = pd.read_csv('src/data/sentiment-analysis.csv')

# Strip whitespace from column names
df.columns = df.columns.str.strip()

# Print the first few rows to debug
print("First few rows of the dataset:")
print(df.head())

# Initialize sentiment analyzer
sentiment_analyzer = SentimentIntensityAnalyzer()
stop_words = set(stopwords.words('english'))

# Process each row
processed_data = []
for index, row in df.iterrows():
    text = row['Text']
    source = row['Source']
    date_time = row['Date/Time']
    user_id = row['User ID']
    location = row['Location']
    confidence_score = row['Confidence Score']

    # Sentiment Analysis (using VADER)
    sentiment_scores = sentiment_analyzer.polarity_scores(text)
    sentiment = 'positive' if sentiment_scores['compound'] > 0.05 else 'negative' if sentiment_scores['compound'] < -0.05 else 'neutral'

    # Keyword Extraction
    # Use a simple whitespace-based tokenizer for MVP
    keywords = [word.strip('.,!?"').lower() for word in text.split() if word.isalnum() and word.lower() not in stop_words]

    # Rule-Based Classification
    is_problem = any(word in text.lower() for word in ['bug', 'error', 'broken', 'issue', 'problem'])
    is_suggestion = any(word in text.lower() for word in ['suggest', 'add', 'feature', 'improve'])

    processed_data.append({
        'text': text,
        'sentiment': sentiment,
        'keywords': keywords,
        'is_problem': is_problem,
        'is_suggestion': is_suggestion,
        'source': source,
        'date_time': date_time,
        'user_id': user_id,
        'location': location,
        'confidence_score': confidence_score
    })

# Save the processed data to a JSON file
with open('src/data/processed_feedback.json', 'w') as f:
    json.dump(processed_data, f, indent=4)

print("Data processing completed. Processed data saved to 'src/data/processed_feedback.json'.") 