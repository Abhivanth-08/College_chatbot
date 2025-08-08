import os
import lancedb
from lancedb.embeddings import get_registry
from lancedb.pydantic import LanceModel, Vector
from sentence_transformers import SentenceTransformer
import fitz

HUGGING_FACE_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = SentenceTransformer(HUGGING_FACE_EMBEDDING_MODEL)
func = get_registry().get("sentence-transformers").create(name=HUGGING_FACE_EMBEDDING_MODEL)
model = SentenceTransformer("all-MiniLM-L6-v2")

PDF_FOLDER = "pdf_gen"
DB_PATH = "data/lancedb"
TABLE_NAME = "pdfdetails"

class PDFMeta(LanceModel):
    name: str
    path: str
    summary: str
    vector: Vector(func.ndims()) = func.VectorField()

def extract_summary(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = doc[0].get_text("text")
        return text.strip().replace('\n', ' ')[:500]
    except Exception as e:
        return "No summary available."

def build_pdf_meta_table():
    db = lancedb.connect(DB_PATH)
    table = db.create_table(TABLE_NAME, schema=PDFMeta,mode="overwrite")
    for filename in os.listdir(PDF_FOLDER):
        if filename.endswith(".pdf"):
            path = os.path.join(PDF_FOLDER, filename)
            summary = extract_summary(path)
            vector = model.encode(filename).tolist()
            table.add([
                {
                    "name": filename,
                    "path": path,
                    "summary": summary,
                    "vector": vector
                }
            ])
            print(f"Added {filename}")
    print("PDF Metadata table created.")

build_pdf_meta_table()

