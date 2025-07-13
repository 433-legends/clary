import csv
import json
from io import StringIO
from agents import Runner
from python.ai.agents.ticketing_agent import filter_feedback
from python.ai.agents.sentiment_agent import sentiment_agent
from python.ai.agents.cluster_labelling_agent import cluster_reviews_agent
from python.ai.clustering import cluster_reviews

async def process_csv_feedbacks(csv_file_content, feedback_column='feedback_text'):
    """
    Process a CSV file to perform sentiment analysis and theme clustering.

    Args:
        csv_file_content (str): Content of the CSV file.
        feedback_column (str): The name of the column containing feedback text.

    Returns:
        dict: A dictionary containing 'sentiment_results' and 'theme_results'.
    """

    sentiment_records = []
    all_feedback_text = []
    csv_reader = csv.DictReader(StringIO(csv_file_content))

    for row in csv_reader:
        try:
            feedback = row.get(feedback_column)
            if not feedback:
                continue

            # Step 1: Filter for valid feedback
            is_valid_feedback = await Runner.run(filter_feedback, feedback)
            if not is_valid_feedback.final_output == 'True':
                print(f"Filtering message '{feedback}' as it is not valid feedback.")
                continue

            # Step 2: Perform sentiment analysis for each valid feedback
            sentiment_analysis = await Runner.run(sentiment_agent, feedback)
            if sentiment_analysis:
                sentiment_dict = json.loads(sentiment_analysis.final_output)
                sentiment_record = {
                    'Sentiment': sentiment_dict.get('Sentiment'),
                    'Explanation': sentiment_dict.get('Explanation'),
                    'Input': feedback
                }
                sentiment_records.append(sentiment_record)
                all_feedback_text.append(feedback)

        except Exception as e:
            print(f"Error processing feedback row: {e}")
            continue

    # Step 3: Perform clustering on all valid feedback texts
    theme_results = []
    if all_feedback_text:
        try:
            clustering_result = await cluster_reviews(all_feedback_text)
            h_clusters = clustering_result.get("hdbscan_clusters", {})
            k_clusters = clustering_result.get("kmeans_clusters", {})

            best_clusters = h_clusters if len(h_clusters) > len(k_clusters) else k_clusters
            print(f"Best clusters selected: {len(best_clusters)} clusters")
            
            if best_clusters:
              theme_results = await generate_labels_from_clusters(best_clusters)

        except Exception as e:
            print(f"Error during feedback clustering: {e}")

    return {
        "sentiment_results": sentiment_records,
        "theme_results": theme_results
    }


async def generate_labels_from_clusters(clusters):
    """
    Generate labels from clusters for feedback categorization.

    Args:
        clusters (dict): Dictionary of clusters where keys are cluster IDs and values are lists of feedback texts.

    Returns:
        List[dict]: List of dictionaries with cluster ID and feedback texts.
    """
    labeled_feedbacks = []
    for cluster_id, feedback_texts in clusters.items():
        try:
            # Limit to first 15 feedback texts for labeling to manage token count
            representative_texts = feedback_texts[:15]

            result = await Runner.run(cluster_reviews_agent, str(representative_texts))
            
            if result and result.final_output:
                cluster_label = result.final_output
                labeled_feedbacks.append({
                    'Label': cluster_label,
                    'FeedbackTexts': feedback_texts,
                })
            else:
                print(f"Failed to generate label for cluster {cluster_id}.")

        except Exception as e:
            print(f"Error generating label for cluster {cluster_id}: {e}")
            continue
            
    return labeled_feedbacks
