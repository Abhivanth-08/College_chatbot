import json
import pandas as pd
import lancedb
from sentence_transformers import SentenceTransformer, CrossEncoder
from langchain.text_splitter import RecursiveCharacterTextSplitter

with open("data/chunks_cache.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [item["text"] for item in data]

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = []
for text in texts:
    chunks.extend(splitter.split_text(text))

print(f"Total chunks: {len(chunks)}")
print("Sample chunk:", chunks[0])


embedding_model = SentenceTransformer("BAAI/bge-large-en-v1.5")
print(f"Loaded embedding model: {'BAAI/bge-large-en-v1.5'}")

batch_size = 512
vectors = []
for i in range(0, len(chunks), batch_size):
    batch = chunks[i:i+batch_size]
    emb = embedding_model.encode(batch, show_progress_bar=True, convert_to_numpy=True)
    vectors.extend(emb)

print(f"Generated {len(vectors)} embeddings.")

db = lancedb.connect("./college_data.lancedb")

df = pd.DataFrame({
    "text": chunks,
    "vector": vectors
})

table = db.create_table("college_info", data=df, mode="overwrite")
print("Data stored in LanceDB.")


reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def search_with_rerank(query, top_k=5):
    query_vector = embedding_model.encode([query], convert_to_numpy=True)[0]
    results = table.search(query_vector).limit(top_k*2).to_df()

    pairs = [(query, row["text"]) for _, row in results.iterrows()]
    scores = reranker.predict(pairs)

    results["score"] = scores
    results = results.sort_values("score", ascending=False).head(top_k)

    return results[["text", "score"]]


query = "chairman of kpr"
results = search_with_rerank(query)

print("\nSearch Results:")
for idx, row in results.iterrows():
    print(f"[{row['score']:.4f}] {row['text']}")
