import csv
import json
from io import StringIO
from agents import Runner
from python.ai.ticketing_agent import filter_feedback
from python.ai.sentiment_agent import sentiment_agent

async def process_csv_feedbacks(csv_file_content):
    """
    Process a CSV file containing feedback data and store it in the database.

    Args:
        csv_file_content (str): Content of the CSV file.

    Returns:
        List[dict]: List of feedback records containing Sentiment, Explaination and Input.
    """

    feedback_records = []
    csv_reader = csv.DictReader(StringIO(csv_file_content))

    for row in csv_reader:
        try:
            feedback = row.get('feedback_text')
            if not feedback:
                continue

            # Assuming filter_feedback is an async function that processes the feedback text
            result = await Runner.run(filter_feedback, feedback)
            if not result.final_output == 'True':
                print("Filtering message {} as it is not a valid feedback.".format(feedback))
                continue

            sentiment_analysis = await Runner.run(sentiment_agent, feedback)

            if sentiment_analysis:
                sentiment_dict = json.loads(sentiment_analysis.final_output)

                feedback_record = {
                    'Sentiment': sentiment_dict['Sentiment'],
                    'Explanation': sentiment_dict['Explanation'],
                    'Input': feedback
                }
                feedback_records.append(feedback_record)
        except Exception as e:
            print(f"Error processing feedback '{feedback}': {e}")
            continue

    return feedback_records