import os
import json
import requests
from typing import List, Dict, Tuple, Optional
import lancedb
from docling.chunking import HybridChunker
from docling.document_converter import DocumentConverter
from dotenv import load_dotenv
from lancedb.embeddings import get_registry
from lancedb.pydantic import LanceModel, Vector
from openai import OpenAI
from wrapper import OpenAITokenizerWrapper
'''
# --- Load Environment Variables ---
load_dotenv()

# --- OpenAI Client and Tokenizer ---
client = OpenAI()
tokenizer = OpenAITokenizerWrapper()
MAX_TOKENS = 8191

# --- File paths ---
docx_path = "output_texts.docx"
chunk_cache_file = "data/chunks_cache.json"  # You can change path as needed

# --- Step 1: Load or Generate Chunks ---
if os.path.exists(chunk_cache_file):
    print("⚠️ Cached chunks found. Loading from file...")
    with open(chunk_cache_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)
else:
    print("🔄 No cache found. Converting and chunking document...")
    converter = DocumentConverter()
    result = converter.convert(docx_path)

    chunker = HybridChunker(
        tokenizer=tokenizer,
        max_tokens=MAX_TOKENS,
        merge_peers=True,
    )

    chunk_iter = chunker.chunk(dl_doc=result.document)
    chunks = [{"text": chunk.text} for chunk in chunk_iter]

    # Save chunks to cache
    os.makedirs(os.path.dirname(chunk_cache_file), exist_ok=True)
    with open(chunk_cache_file, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2)

print(f"✅ Total chunks ready: {len(chunks)}")'''

'''
path="data/chunks_cache.json"
f=open(path,"r")
chunks=json.load(f)
f.close()

db = lancedb.connect("data/lancedb")
embedding_func = get_registry().get("jina-ai").create(name="jina-embeddings-v2-base-en")

class Chunks(LanceModel):
    text: str = embedding_func.SourceField()
    vector: Vector(embedding_func.ndims()) = embedding_func.VectorField()

table = db.create_table("docling_text_vectors_only", schema=Chunks, mode="overwrite")
table.add(chunks)

print(f"✅ Successfully added {len(chunks)} chunks to LanceDB.")
print(table.to_pandas().head())
print(f"📦 Total rows in table '{table.name}': {table.count_rows()}")
print("🎉 Process complete!")'''


'''
import os
import json
import lancedb
import lancedb.embeddings as ld
from lancedb.pydantic import Vector, LanceModel
import time
from typing import List, Dict, Any


os.environ["JINA_API_KEY"] = "jina_c4b2a33bd5794ddd98cf5f3905ce632bvPvHYr2uy3e3Eq9XUjBKR-yKV78e"

embedding_func = ld.JinaEmbeddings()

path = "data/chunks_cache.json"
try:
    with open(path, "r") as f:
        chunks_data = json.load(f)
except FileNotFoundError:
    print(f"Error: chunks_cache.json not found at {path}. Please ensure the file exists.")
    exit()
except json.JSONDecodeError:
    print(f"Error: Could not decode JSON from {path}. Check file format.")
    exit()

chunks = []
max_retries = 5
base_delay = 2

print(f"Starting to generate embeddings for {len(chunks_data)} chunks...")

for i, chunk in enumerate(chunks_data):
    text = chunk["text"]
    if len(text) > 8192:
        text = text[:8192]
        print(f"Warning: Chunk {i} truncated to 8192 characters.")
    retries = 0
    vector = None
    while retries < max_retries:
        try:
            vector = embedding_func.generate_text_embeddings(text)
            break # Success, break out of retry loop
        except RuntimeError as e:
            if "The request could not be processed" in str(e):
                delay = base_delay * (2 ** retries) # Exponential backoff
                print(f"Jina API error for chunk {i}: {e}. Retrying in {delay} seconds (Attempt {retries + 1}/{max_retries})...")
                time.sleep(delay)
                retries += 1
            else:
                print(f"An unexpected error occurred for chunk {i}: {e}. Skipping this chunk.")
                vector = None
                break
        except Exception as e:
            print(f"An unknown error occurred during embedding generation for chunk {i}: {e}. Skipping this chunk.")
            vector = None
            break

    if vector is not None:
        chunks.append({"text": text, "vector": vector})
    else:
        print(f"Failed to generate embedding for chunk {i} after {max_retries} retries. This chunk will be skipped.")

if not chunks:
    print("No chunks were successfully processed with embeddings. Exiting.")
    exit()


f = open("data/vector.json", "w")
json.dump(chunks,f, indent=2)
f.close()'''

import os
import json
import lancedb
import lancedb.embeddings as ld
from lancedb.pydantic import Vector, LanceModel
import time
from typing import List, Dict, Any

import os
import json
import lancedb
from lancedb.pydantic import LanceModel, Vector
import lancedb.embeddings as ld

# Set API key for Jina
os.environ["JINA_API_KEY"] = "jina_c4b2a33bd5794ddd98cf5f3905ce632bvPvHYr2uy3e3Eq9XUjBKR-yKV78e"

# Initialize embedding function
embedding_func = ld.JinaEmbeddings()

# Load chunks
with open("data/vector.json") as f:
    chunks = json.load(f)

# Check vector dimension
print("Sample vector length:", len(chunks[0]["vector"][0]))

# Define schema
class Chunks(LanceModel):
    text: str
    vector: Vector(embedding_func.ndims())

# Connect to DB and create table
db = lancedb.connect("data/lancedb")
table = db.create_table("docling_text_vectors_only", schema=Chunks, mode="overwrite")


data_to_insert = [
    {"text": i["text"], "vector": i["vector"][0]}
    for i in chunks
]

# ✅ Add all at once
table.add(data_to_insert)

print(f"✅ Successfully added {len(chunks)} chunks to LanceDB.")
print(table.to_pandas().head())
print(f"📦 Total rows in table '{table.name}': {table.count_rows()}")
print("🎉 Process complete!")
