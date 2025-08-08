import os
import fitz  # PyMuPDF
import lancedb
from lancedb.pydantic import LanceModel, Vector
from lancedb.embeddings import get_registry
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# --- LangChain Import ---
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Configuration ---
HUGGING_FACE_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
# Note: For LangChain's default RecursiveCharacterTextSplitter, chunk_size is in characters.
# Adjust this based on your desired chunk length in characters.
# A common guideline for RAG is chunks of 200-500 words, which is roughly 1000-2500 characters.
# Let's start with a character count, assuming roughly 4 chars per token for English.
# If your target LLM context is 256 tokens, that's roughly 1024 characters.
CHUNK_SIZE_CHARS = 256  # Max characters per chunk
CHUNK_OVERLAP_CHARS = 100  # Overlap between chunks

LANCEDB_TABLE_NAME = "testing_table_fitz"  # New distinct table name
DB_PATH = "data/lancedb"
BATCH_SIZE_LANCEDB_INSERT = 100

# --- Initialize Models ---
embedding_model = SentenceTransformer(HUGGING_FACE_EMBEDDING_MODEL)


# --- PDF Text Extraction Function (using fitz) ---
def get_pdf_text_details(pdf_path: str) -> dict:
    text_details = {
        'status': 'error',
        'message': 'An unknown error occurred.',
        'full_text': '',
        'source_url': pdf_path
    }
    try:
        doc = fitz.open(pdf_path)
        full_document_text = []
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            full_document_text.append(page.get_text("text"))
        doc.close()
        text_details['full_text'] = "\n".join(full_document_text)
        text_details['status'] = 'success'
        text_details['message'] = f"Successfully extracted text from {doc.page_count} pages."

    except FileNotFoundError:
        text_details['message'] = f"Error: PDF file not found at '{pdf_path}'."
    except fitz.EmptyFileError:
        text_details['message'] = f"Error: PDF file '{pdf_path}' is empty or corrupted."
    except Exception as e:
        text_details['message'] = f"An unexpected error occurred: {e}"

    return text_details


# --- LanceDB Schema Definition (only text and vector) ---
func = get_registry().get("sentence-transformers").create(name=HUGGING_FACE_EMBEDDING_MODEL)


class LangchainChunk(LanceModel):
    text: str = func.SourceField()
    vector: Vector(func.ndims()) = func.VectorField()


# --- Main Processing Logic ---
def process_pdf_with_langchain_chunking_to_lancedb(pdf_path: str):
    print(f"\n--- Processing PDF: {pdf_path} ---")

    # 1. Extract text using PyMuPDF
    pdf_details = get_pdf_text_details(pdf_path)

    if pdf_details['status'] != 'success':
        print(f"Failed to extract text from PDF: {pdf_details['message']}")
        return

    full_text = pdf_details['full_text']

    if not full_text.strip():
        print("Extracted text is empty. No chunks to process.")
        return

    # 2. Chunk the text using LangChain's RecursiveCharacterTextSplitter
    print("Starting chunking process using LangChain's RecursiveCharacterTextSplitter...")

    # Initialize the text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE_CHARS,
        chunk_overlap=CHUNK_OVERLAP_CHARS,
        length_function=len,  # This tells it to count characters
        is_separator_regex=False,  # Use literal separators, not regex patterns
        separators=["\n\n", "\n", ". ", " ", ""]
        # Order of splitting preference: paragraphs, lines, sentences, words, characters
    )

    # Split the raw text into chunks (list of strings)
    langchain_chunks = text_splitter.split_text(full_text)

    if not langchain_chunks:
        print("LangChain RecursiveCharacterTextSplitter generated no chunks.")
        return

    print(f"Generated {len(langchain_chunks)} chunks using RecursiveCharacterTextSplitter.")

    # 3. Generate embeddings and prepare chunks for LanceDB
    chunks_for_db = []
    print("Generating embeddings and preparing chunks for LanceDB...")
    for i, chunk_text in enumerate(tqdm(langchain_chunks, desc="Embedding chunks")):
        if not chunk_text.strip():
            continue  # Skip empty chunks

        try:
            vector = embedding_model.encode(chunk_text).tolist()
            chunks_for_db.append({
                "text": chunk_text,
                "vector": vector,
            })
        except Exception as e:
            print(f"Error embedding chunk {i} ('{chunk_text[:50]}...'): {e}. Skipping.")

    if not chunks_for_db:
        print("No valid chunks were embedded for LanceDB insertion.")
        return

    # 4. Connect to LanceDB and handle table existence
    db = lancedb.connect(DB_PATH)
    try:
        table = db.open_table(LANCEDB_TABLE_NAME)
        print(f"Opened existing LanceDB table: {LANCEDB_TABLE_NAME}")
    except lancedb.errors.TableNotFound:
        table = db.create_table(LANCEDB_TABLE_NAME, schema=LangchainChunk)
        print(f"Created new LanceDB table: {LANCEDB_TABLE_NAME}")

    # 5. Add chunks to LanceDB in batches
    print(f"Adding {len(chunks_for_db)} chunks to LanceDB in batches...")
    for i in tqdm(range(0, len(chunks_for_db), BATCH_SIZE_LANCEDB_INSERT), desc="Adding to LanceDB"):
        batch = chunks_for_db[i:i + BATCH_SIZE_LANCEDB_INSERT]
        table.add(batch)

    print(f"Successfully added {len(chunks_for_db)} chunks to LanceDB.")
    print(f"Total rows in LanceDB table '{table.name}': {table.count_rows()}")
    print("Process complete for this PDF.")



lo=[]
for i in os.listdir("pdf_jpg//pdf"):
    lo.append("pdf_jpg//pdf//"+i)

def process(pdf_file_path):
    process_pdf_with_langchain_chunking_to_lancedb(pdf_file_path)
    try:
        db = lancedb.connect(DB_PATH)
        table = db.open_table(LANCEDB_TABLE_NAME)
        print(f"Total entries in '{table.name}': {table.count_rows()}")
        sample_entries = table.to_list(limit=5)
        if sample_entries:
            print("\nSample entries:")
            for entry in sample_entries:
                print(f"  Text: '{entry['text'][:100]}...'")  # Print first 100 chars
                print(f"  Vector (first 5 dims): {entry['vector'][:5]}...")
                print("-" * 30)
        else:
            print("No entries found in the table.")

    except Exception as e:
        print(f"Error verifying LanceDB: {e}")

c=0

for i in lo:
    process(i)
    c+=1
    print(c)
