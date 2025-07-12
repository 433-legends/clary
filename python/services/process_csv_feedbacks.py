import csv
import json
from io import StringIO
from agents import Runner
from python.ai.agents.ticketing_agent import filter_feedback
from python.ai.agents.sentiment_agent import sentiment_agent
from python.ai.agents.cluster_labelling_agent import cluster_reviews_agent
from python.ai.clustering import cluster_reviews

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


async def process_csv_feedbacks_with_categories(csv_file_content):
    """
    Process a CSV file containing feedback data with categories.

    This function collects unique feedback texts from the CSV using a set,
    then calls a clustering function from clustering.py with the deduplicated list.

    Args:
        csv_file_content (str): Content of the CSV file.

    Returns:
        The result returned by cluster_feedbacks.
    """
    feedback_set = set()
    csv_reader = csv.DictReader(StringIO(csv_file_content))

    for row in csv_reader:
        feedback = row.get('feedback_text')
        if feedback:
            feedback_set.add(feedback)

    clustering_result = await cluster_reviews(list(feedback_set))
    h_clusters = clustering_result.get("hdbscan_clusters", {})
    k_clusters = clustering_result.get("kmeans_clusters", {})

    best_clusters = h_clusters if len(h_clusters) > len(k_clusters) else k_clusters
    print(f"Best clusters selected: {len(best_clusters)} clusters")

    return await generate_labels_from_clusters(best_clusters)


async def generate_labels_from_clusters(clusters):
    """
    Generate labels from clusters for feedback categorization.

    Args:
        clusters (dict): Dictionary of clusters where keys are cluster IDs and values are lists of feedback texts.

    Returns:
        List[dict]: List of dictionaries with cluster ID and feedback texts.
    """
    labeled_feedbacks = []
    for cluster in clusters:
        feedback_texts = clusters[cluster]
        if len(feedback_texts) >= 15:
            feedback_texts = feedback_texts[0:15]  # Limit to first 15 feedback texts for labeling

        result = await Runner.run(cluster_reviews_agent, str(feedback_texts))
        if result and result.final_output:
            cluster_label = result.final_output
            labeled_feedbacks.append({
                'FeedbackTexts': clusters[cluster],
                'Label': cluster_label
            })
        else:
            print(f"Failed to generate label for cluster {cluster}. Using first feedback text as label.")


        # Assuming we want to label the cluster with the first feedback text
        label = feedback_texts[0]

    return labeled_feedbacks
