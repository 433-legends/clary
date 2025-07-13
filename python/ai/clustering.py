import csv
import os
from io import StringIO
import umap
# import matplotlib.pyplot as plt
import openai
import hdbscan
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

async def cluster_reviews(reviews, min_cluster_size=3, kmeans_clusters=5):
    """
    Clusters reviews using OpenAI embeddings with HDBSCAN and KMeans,
    then returns both cluster groupings.

    Args:
        reviews (list of str): The review texts to cluster.
        min_cluster_size (int): Minimum cluster size for HDBSCAN.
        kmeans_clusters (int): Number of clusters for KMeans.
        api_key (str): Your OpenAI API key. If None, uses environment variable.

    Returns:
        dict: {
            "hdbscan_clusters": dict(cluster_id -> list of reviews),
            "kmeans_clusters": dict(cluster_id -> list of reviews)
        }
    """
    copy_reviews = reviews.copy()
    cleaned_reviews = clean_reviews_nltk(copy_reviews)

    openai.api_key = openai_api_key

    print(f"🔍 Generating embeddings for {len(reviews)} reviews...")
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=cleaned_reviews,
        dimensions=512
    )
    embeddings = [item.embedding for item in response.data]

    # embeddings = model.encode(cleaned_reviews, show_progress_bar=True, convert_to_tensor=True).tolist()

    # plot_embeddings_2d(embeddings, method='umap', save_path='/Users/apple/Desktop/Clarities/embeddings_umap.png')

    umap_model = umap.UMAP(n_neighbors=15, n_components=10, min_dist=0.0, metric='cosine', random_state=42)
    reduced_embeddings = umap_model.fit_transform(embeddings)

    print(f"🔗 Clustering using HDBSCAN (min_cluster_size={min_cluster_size})...")
    clusterer = hdbscan.HDBSCAN(min_cluster_size=10)
    hdbscan_labels = clusterer.fit_predict(reduced_embeddings)

    # plot_embeddings_2d(embeddings, labels=hdbscan_labels, method='umap', save_path='/Users/apple/Desktop/Clarities/embeddings_hdbscan.png')

    # Group reviews by HDBSCAN cluster, excluding outliers (-1)
    hdbscan_clusters = {}
    for idx, label in enumerate(hdbscan_labels):
        if label == -1:
            continue  # skip outliers
        hdbscan_clusters.setdefault(label, []).append(reviews[idx])

    print(f"🔗 Clustering using KMeans (k={kmeans_clusters})...")
    kmeans = KMeans(n_clusters=kmeans_clusters, random_state=42)
    kmeans_labels = kmeans.fit_predict(embeddings)

    # plot_embeddings_2d(embeddings, labels=kmeans_labels, method='umap', save_path='/Users/apple/Desktop/Clarities/embeddings_kmeans.png')


    # Group reviews by KMeans cluster
    kmeans_clusters_dict = {i: [] for i in range(kmeans_clusters)}
    for idx, label in enumerate(kmeans_labels):
        kmeans_clusters_dict[label].append(reviews[idx])

    return {
        "hdbscan_clusters": hdbscan_clusters,
        "kmeans_clusters": kmeans_clusters_dict
    }


if __name__ == "__main__":
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

    pixel_product_reviews = [
        "The camera captures incredible detail, even in low light.",
        "Portrait mode on the camera is hit or miss, especially with edges.",
        "Zoom is surprisingly clear even at 5x. Really impressed.",
        "Video stabilization works great while walking or panning.",
        "Night Sight is pure magic, easily the best among phones.",
        "Colors on the photos feel a bit too saturated sometimes.",
        "The screen is vibrant and bright, even outdoors in sunlight.",
        "Touch response on the display is smooth and snappy.",
        "High refresh rate makes scrolling feel super fluid.",
        "Screen glare in direct light is still a problem.",
        "The display is sharp but I wish it was slightly bigger.",
        "Accidentally touch the edges too often — needs palm rejection tuning.",
        "Voice clarity during calls is top notch, even in noisy places.",
        "Speakerphone sounds clean and doesn't echo much.",
        "People say I sound clearer now than on my old phone.",
        "Sometimes I get robotic-sounding voices in weak signal areas.",
        "Bluetooth calls sound fine but sometimes drop unexpectedly.",
        "Mic pickup is excellent — great for voice memos and meetings.",
        "The camera app launches quickly and is easy to navigate.",
        "Selfies look natural and not overprocessed like other phones.",
        "Screen auto-brightness adapts too slowly in low light.",
        "Display colors are a bit warm by default, but adjustable.",
        "Voice assistant hears me clearly even from across the room.",
        "No issues at all with call quality — very consistent performance."
    ]

    clusters = cluster_reviews(reviews, min_cluster_size=2)

    print(clusters)
