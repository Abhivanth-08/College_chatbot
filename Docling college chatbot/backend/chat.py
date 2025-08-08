import os
import lancedb
from sentence_transformers import SentenceTransformer
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from typing import List, Dict, Any
import pandas
from custom_wrapper import OpenRouterChat  # Your custom OpenRouter wrapper
from dotenv import load_dotenv
from lancedb.pydantic import LanceModel,Vector
import numpy as np
from lancedb.embeddings import get_registry
from pdfagent import pdfsorno
import lancedb.embeddings as ld

os.environ["JINA_API_KEY"] = "jina_c4b2a33bd5794ddd98cf5f3905ce632bvPvHYr2uy3e3Eq9XUjBKR-yKV78e"
func = ld.JinaEmbeddings()

'''HUGGING_FACE_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
func = get_registry().get("sentence-transformers").create(name=HUGGING_FACE_EMBEDDING_MODEL)
model = SentenceTransformer("all-MiniLM-L6-v2")

HUGGING_FACE_EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = SentenceTransformer(HUGGING_FACE_EMBEDDING_MODEL_NAME)
print(f"Loaded embedding model: {HUGGING_FACE_EMBEDDING_MODEL_NAME}")'''

class Chunks(LanceModel):
    text: str = func.SourceField()
    vector: Vector(func.ndims()) = func.VectorField()

'''def normalize(v: list[float]) -> list[float]:
    norm = np.linalg.norm(v)
    if norm == 0:
        return v
    return (np.array(v) / norm).tolist()'''


load_dotenv()


DB_PATH = "data/lancedb"
LANCEDB_TABLE_NAME = "docling_huggingface_embeddings"
LANCEDB_TABLE_NAME="testing_table"
LANCEDB_TABLE_NAME="docling_text_vectors_only"




OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable not set. Please set it in your .env file.")


llm = OpenRouterChat(
    api_key=OPENROUTER_API_KEY,
    model="meta-llama/llama-3-70b-instruct",
    temperature=0.4,
    max_tokens=500
)
print(f"Initialized LLM: {llm.model}")


try:
    db = lancedb.connect(DB_PATH)
    table = db.open_table(LANCEDB_TABLE_NAME)
    print(f"Successfully connected to LanceDB table: {LANCEDB_TABLE_NAME}")
    print(f"Total entries in vector store: {table.count_rows()}")

except Exception as e:
    print(f"Error connecting to LanceDB or opening table: {e}")
    print("Please ensure you've run the document processing script and the LanceDB table exists.")
    exit()

def retrieve_context_from_lancedb(query: str, k: int = 1) -> str:
    query_vector = func.generate_text_embeddings(query)[0]
    search_results = table.search(query_vector).limit(k).to_list()
    relevant_texts = [result['text'] for result in search_results]
    print(relevant_texts)
    if not relevant_texts:
        return "No relevant context found."
    return "\n---\n".join(relevant_texts)


rag_template = """
You are a helpful assistant. Use the following context to answer the question.
If the answer is not in the context, say "I don't have enough information to answer that question based on the provided context."
Do NOT make up answers.

Context:
{context}

Question:
 {question}
"""
rag_prompt = ChatPromptTemplate.from_template(rag_template)

rag_chain = (
    {
        "context": RunnableLambda(retrieve_context_from_lancedb),
        "question": RunnablePassthrough()
    }
    | rag_prompt
    | llm
    | StrOutputParser()
)

def chatbot_interaction(user_query):
    print("LangChain RAG Chatbot Ready")
    user_query = user_query.strip()
    #k=pdfsorno(user_query)
    #print("Searching and generating response...")
    try:
        response = rag_chain.invoke(user_query)
        print("\n--- Chatbot Response ---")
        '''if k and k.get("path"):
            file_name = os.path.basename(k["path"])
            iframe_html = f"""
            <b>📄 PDF Found:</b><br/>
            <a href="http://localhost:8000/get_pdf?filename={file_name}" target="_blank">
              <button style="margin-top: 8px; padding: 8px 16px; border-radius: 6px; background-color: #007bff; color: white; border: none;">
                Open {k['name']}
              </button>
            </a>"""
            response += iframe_html'''
        print(response)
        return response
    except Exception as e:
        print(f"An error occurred during response generation: {e}")
        print("Please check your API key, model, and network connection.")

#chatbot_interaction("list of labs in Computer Science and Engineering")


while True:
    p=input("Text Input : ")
    chatbot_interaction(p)

