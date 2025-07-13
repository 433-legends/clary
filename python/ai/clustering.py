import csv
import os
from io import StringIO
import umap
# import matplotlib.pyplot as plt
import openai
import hdbscan
import anyio
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
from InstructorEmbedding import INSTRUCTOR

from sentence_transformers import SentenceTransformer

openai_api_key = os.getenv("OPENAI_API_KEY")

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re

nltk.download("punkt")
nltk.download("stopwords")
nltk.download('punkt_tab')

model = SentenceTransformer('all-mpnet-base-v2')

def clean_reviews_nltk(reviews):
    stop_words = set(stopwords.words("english"))
    cleaned_reviews = []

    for review in reviews:
        # Lowercase
        text = review.lower()
        # Remove non-alphabetic characters
        text = re.sub(r'[^a-z\s]', '', text)
        # Tokenize
        words = word_tokenize(text)
        # Remove stopwords and short words
        words = [w for w in words if w not in stop_words and len(w) > 2]
        cleaned_reviews.append(" ".join(words))

    return cleaned_reviews



# def plot_embeddings_2d(embeddings, labels=None, annotate=False, method='umap', save_path=None):
#     """
#     Projects high-dimensional embeddings to 2D and saves or shows the plot.
#
#     Args:
#         embeddings (list or np.ndarray): High-dimensional vectors.
#         labels (list of int or str, optional): Cluster labels or point categories for coloring.
#         annotate (bool): If True, annotate each point with its index.
#         method (str): 'umap' or 'tsne' for dimensionality reduction.
#         save_path (str, optional): Path to save the plot image (e.g., 'plot.png').
#
#     Returns:
#         None
#     """
#     if method == 'tsne':
#         from sklearn.manifold import TSNE
#         reducer = TSNE(n_components=2, random_state=42)
#     else:
#         reducer = umap.UMAP(n_components=2, random_state=42)
#
#     reduced = reducer.fit_transform(embeddings)
#
#     plt.figure(figsize=(10, 6))
#     if labels is not None:
#         plt.scatter(reduced[:, 0], reduced[:, 1], c=labels, cmap='tab10', s=40)
#     else:
#         plt.scatter(reduced[:, 0], reduced[:, 1], s=40)
#
#     if annotate:
#         for i, (x, y) in enumerate(reduced):
#             plt.annotate(str(i), (x, y), fontsize=8)
#
#     plt.title("2D Projection of Embeddings")
#     plt.xlabel("Component 1")
#     plt.ylabel("Component 2")
#     plt.tight_layout()
#
#     if save_path:
#         plt.savefig(save_path, dpi=300)
#         print(f"✅ Plot saved to {save_path}")
#     else:
#         plt.show()
#
#     plt.close()

def perform_clustering_sync(reviews, embeddings, min_cluster_size=3, kmeans_clusters=5):
    """
    Performs synchronous, CPU-bound clustering on pre-computed embeddings.
    """
    umap_model = umap.UMAP(n_neighbors=15, n_components=10, min_dist=0.0, metric='cosine', random_state=42)
    reduced_embeddings = umap_model.fit_transform(embeddings)

    print(f"🔗 Clustering using HDBSCAN (min_cluster_size={min_cluster_size})...")
    clusterer = hdbscan.HDBSCAN(min_cluster_size=10)
    hdbscan_labels = clusterer.fit_predict(reduced_embeddings)

    # Group reviews by HDBSCAN cluster, excluding outliers (-1)
    hdbscan_clusters = {}
    for idx, label in enumerate(hdbscan_labels):
        if label == -1:
            continue  # skip outliers
        hdbscan_clusters.setdefault(label, []).append(reviews[idx])

    print(f"🔗 Clustering using KMeans (k={kmeans_clusters})...")
    kmeans = KMeans(n_clusters=kmeans_clusters, random_state=42)
    kmeans_labels = kmeans.fit_predict(embeddings)

    # Group reviews by KMeans cluster
    kmeans_clusters_dict = {i: [] for i in range(kmeans_clusters)}
    for idx, label in enumerate(kmeans_labels):
        kmeans_clusters_dict[label].append(reviews[idx])

    return {
        "hdbscan_clusters": hdbscan_clusters,
        "kmeans_clusters": kmeans_clusters_dict
    }

async def cluster_reviews(reviews, min_cluster_size=3, kmeans_clusters=5):
    """
    Asynchronously generates embeddings and then clusters them in a background thread.
    """
    copy_reviews = reviews.copy()
    cleaned_reviews = clean_reviews_nltk(copy_reviews)

    openai.api_key = openai_api_key

    print(f"🔍 Generating embeddings for {len(reviews)} reviews...")
    response = await anyio.to_thread.run_sync(
        openai.embeddings.create,
        model="text-embedding-3-small",
        input=cleaned_reviews,
        dimensions=512
    )
    embeddings = [item.embedding for item in response.data]

    # Run the synchronous, CPU-bound clustering in a separate thread
    return await anyio.to_thread.run_sync(
        perform_clustering_sync,
        reviews,
        embeddings,
        min_cluster_size,
        kmeans_clusters
    )


if __name__ == "__main__":
    # This part needs to be updated to work with the new async structure
    async def main():
        review_file = "/Users/apple/Desktop/Clarities/product_feedback_2.csv"
        with open(review_file, 'r', encoding='utf-8') as f:
            csv_file_content = f.read()

        csv_reader = csv.DictReader(StringIO(csv_file_content))

        # Extract feedback_text from the CSV
        reviews = []
        for row in csv_reader:
            feedback = row.get('feedback_text')
            if feedback:
                reviews.append(feedback)

        unique_reviews = set(reviews)
        reviews = list(unique_reviews)  # Remove duplicates

        clusters = await cluster_reviews(reviews, min_cluster_size=2)
        print(clusters)

    anyio.run(main)
