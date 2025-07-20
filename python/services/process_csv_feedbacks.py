import csv
import json
from io import StringIO
import asyncio
import pandas as pd
from agents import Runner
from python.ai.agents.sentiment_agent import sentiment_agent
from python.ai.agents.cluster_labelling_agent import cluster_reviews_agent
from python.ai.clustering import cluster_reviews

BATCH_SIZE = 20

async def process_csv_feedbacks(csv_file_content, feedback_column='feedback_text', filter_feedback=False):
    """
    Process a CSV file containing feedback data and store it in the database.

    Args:
        csv_file_content (str): Content of the CSV file.
        feedback_column (str): Name of the column containing feedback text.
        filter_feedback (bool): Whether to filter feedbacks or not.

    Returns:
        List[dict]: List of feedback records containing Sentiment, Explaination and Input.
    """

    feedback_records = []
    all_feedback_list = pd.read_csv(
        StringIO(csv_file_content),
        usecols=[feedback_column]
    )[feedback_column].dropna().tolist()
    all_feedback_set = set(all_feedback_list)
    chunked_feedback_list = await chunk_set(all_feedback_set, BATCH_SIZE)
    sentiment_tasks = [Runner.run(sentiment_agent, str(chunk)) for chunk in chunked_feedback_list]
    sentiment_analyses = await asyncio.gather(*sentiment_tasks)

    for sentiment_analysis in sentiment_analyses:
        if sentiment_analysis:
            output = sentiment_analysis.final_output
            if output.startswith('```json') and output.endswith('```'):
                output = output[7:-3].strip()

            sentiment_list = json.loads(output)
            feedback_records.append(sentiment_list)
            print(f"Processed batch of {len(sentiment_list)} feedbacks.")
    # for chunk in chunked_feedback_list:
    #     print(f"Processing chunk of size {len(chunk)}")
    #     if filter_feedback:
    #         try:
    #             result = await Runner.run(filter_feedback_agent, str(chunk))
    #             if not result.final_output == 'True':
    #                 print("Filtering out invalid feedbacks.")
    #                 continue
    #         except Exception as e:
    #             raise HTTPException(f"Error filtering feedbacks: {e}")
    #
    #     sentiment_analysis = await Runner.run(sentiment_agent, str(chunk))
    #
    #     if sentiment_analysis:
    #         output = sentiment_analysis.final_output
    #         if output.startswith('```json') and output.endswith('```'):
    #             output = output[7:-3].strip()
    #
    #         sentiment_list = json.loads(output)
    #
    #         feedback_records.append(sentiment_list)
    #         print(f"Processed batch of {len(sentiment_list)} feedbacks.")

    return feedback_records

async def chunk_set(input_set, chunk_size):
    """
    Chunk a set into smaller lists of a specified size.
    """
    input_list = list(input_set)
    return [input_list[i:i + chunk_size] for i in range(0, len(input_list), chunk_size)]


async def process_csv_feedbacks_with_categories(csv_file_content, feedback_column='feedback_text'):
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
        feedback = row.get(feedback_column)
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
