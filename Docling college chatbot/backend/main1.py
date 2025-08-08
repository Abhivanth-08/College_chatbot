import requests
import os
from typing import List, Dict, Tuple, Optional
import lancedb
from docling.chunking import HybridChunker
from docling.document_converter import DocumentConverter
from dotenv import load_dotenv
from lancedb.embeddings import get_registry
from lancedb.pydantic import LanceModel, Vector
import _csv  # Keep this for specific error catching

from sentence_transformers import SentenceTransformer

from wrapper import OpenAITokenizerWrapper

load_dotenv()

# For example: "sentence-transformers/all-MiniLM-L6-v2" (fast, small, 384 dims)
# Or: "BAAI/bge-small-en-v1.5" (better performance, 512 dims)
# Or: "intfloat/multilingual-e5-large" (multilingual, larger, 1024 dims)
HUGGING_FACE_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

MAX_TOKENS = 256

tokenizer = OpenAITokenizerWrapper()


def is_valid_url(url):
    try:
        response = requests.head(url, timeout=5, allow_redirects=True)
        return response.status_code < 404  # Accepts up to 499
    except requests.exceptions.RequestException:
        return False


with open("sub2.txt", "r", encoding="utf-8") as f:
    sitemap_urls = [url.strip() for url in f if url.strip()]

print(f"Found {len(sitemap_urls)} URLs in sub2.txt")
sitemap_urls = [url for url in sitemap_urls if url]
valid_urls = [url for url in sitemap_urls if is_valid_url(url)]
print(f"Found {len(valid_urls)} valid URLs after checking.")

if not valid_urls:
    print("No valid URLs found to process. Exiting.")
    exit()

converter = DocumentConverter()
conv_results_iter = converter.convert_all(valid_urls)

c = 0
docs = []

# New approach: Iterate and catch specific errors during the iteration
# We need to wrap the iteration of the generator in a try-except.
# The challenge is identifying *which* URL caused the issue when it's inside the generator.
# A common pattern is to make the generator itself robust, but we can't modify docling.
# So, we iterate one by one and try to catch.

processed_urls_count = 0
for url in valid_urls:
    try:
        # Convert each URL individually to isolate the problematic one
        # This will create a new generator for each URL, so it's less efficient
        # but allows for pinpointing and skipping.
        single_conv_iter = converter.convert_all([url])
        result = next(single_conv_iter)  # Get the first (and only) result

        if result.document:
            c += 1
            docs.append(result.document)
            print(
                f"Successfully converted and added document: {result.document_url if hasattr(result, 'document_url') else url}")
            print(f"Total documents collected: {c}")
        elif result.error:
            # If docling's internal mechanism catches and stores an error
            print(
                f"Conversion error for URL: {result.document_url if hasattr(result, 'document_url') else url}. Error: {result.error}. Skipping this document.")
        else:
            print(f"Conversion result inconclusive for URL: {url}. Skipping.")
    except _csv.Error as csv_err:
        # This specific error is raised directly by csv.py during sniff().
        # This catch block will now accurately report the URL that caused it.
        print(f"Caught CSV error for URL: {url}. Error: {csv_err}. Skipping this document.")
    except Exception as e:
        # Catch any other unexpected errors during the processing of a single URL
        print(f"An unexpected error occurred while processing URL: {url}. Error: {e}. Skipping this document.")

    processed_urls_count += 1
    # print(f"Processed {processed_urls_count}/{len(valid_urls)} URLs.") # Optional progress

print(f"\nTotal documents successfully converted and collected: {len(docs)}")

if not docs:
    print("No documents were successfully converted. Cannot perform chunking. Exiting.")
    exit()

chunker = HybridChunker(
    tokenizer=tokenizer,
    max_tokens=MAX_TOKENS,
    merge_peers=True,
)

mc = []
print("\nStarting chunking process...")
for i, doc in enumerate(docs):
    current_url = getattr(doc, 'source_url', 'N/A')
    try:
        chunk_iter = chunker.chunk(dl_doc=doc)
        chunks_for_doc = list(chunk_iter)
        mc.extend(chunks_for_doc)
    except Exception as e:
        print(f"    - Error chunking document {i + 1} ({current_url}): {e}")

print(f"\nTotal number of chunks generated from all documents: {len(mc)}")

db = lancedb.connect("data/lancedb")

# --- MODIFIED: Use the Sentence Transformers registry ---
func = get_registry().get("sentence-transformers").create(name=HUGGING_FACE_EMBEDDING_MODEL)


class Chunks(LanceModel):
    text: str = func.SourceField()
    vector: Vector(func.ndims()) = func.VectorField()  # type: ignore


table = db.open_table("docling_huggingface_embeddings")

processed_chunks = []
for i, chunk in enumerate(mc):
    try:
        processed_chunks.append({
            "text": str(chunk.text) if chunk.text is not None else "",
        })
    except Exception as e:
        print(f"Error processing chunk {i} for LanceDB: {e}")
        continue

if processed_chunks:
    table.add(processed_chunks)
    print(f"Successfully added {len(processed_chunks)} chunks to LanceDB.")
else:
    print("No chunks to add to LanceDB.")

print(f"\nTotal rows in LanceDB table '{table.name}': {table.count_rows()}")

print("\nProcess complete!")

