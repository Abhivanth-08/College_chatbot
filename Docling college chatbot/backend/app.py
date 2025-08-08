import os
import lancedb
import streamlit as st
from dotenv import load_dotenv
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

from custom_wrapper import OpenRouterChat  # Your custom OpenRouter wrapper

# Load environment variables
load_dotenv()

# Constants
DB_PATH = "data/lancedb"
LANCEDB_TABLE_NAME = "docling_huggingface_embeddings"
#LANCEDB_TABLE_NAME="testing_table"
HUGGING_FACE_EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Load Embedding Model
embedding_model = SentenceTransformer(HUGGING_FACE_EMBEDDING_MODEL_NAME)

# Load OpenRouter API Key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    st.error("OPENROUTER_API_KEY not found in environment.")
    st.stop()

# Initialize LLM
llm = OpenRouterChat(
    api_key=OPENROUTER_API_KEY,
    model="mistralai/mistral-7b-instruct:free",
    temperature=0.4,
    max_tokens=500
)

# Connect to LanceDB
try:
    db = lancedb.connect(DB_PATH)
    table = db.open_table(LANCEDB_TABLE_NAME)
except Exception as e:
    st.error(f"Error connecting to LanceDB: {e}")
    st.stop()

# Retrieval Function
def retrieve_context_from_lancedb(query: str, k: int = 10) -> str:
    query_vector = embedding_model.encode(query).tolist()
    search_results = (
        table.search(query_vector)
        .limit(k)
        .to_list()
    )
    relevant_texts = [result["text"] for result in search_results]
    if not relevant_texts:
        return "No relevant context found."
    return "\n---\n".join(relevant_texts)

# Optional helper to get chunks
def get_chunks(query: str, k: int = 20) -> List[str]:
    query_vector = embedding_model.encode(query).tolist()
    search_results = (
        table.search(query_vector)
        .limit(k)
        .to_list()
    )
    return [result["text"] for result in search_results]

# RAG Prompt
rag_template = """
You are a helpful assistant. Use the following context to answer the question.
If the answer is not in the context, say "I don't have enough information to answer that question based on the provided context."
Do NOT make up answers.

Context:
{context}

Question: {question}
"""
rag_prompt = ChatPromptTemplate.from_template(rag_template)

# LangChain RAG Chain
rag_chain = (
    {
        "context": RunnableLambda(retrieve_context_from_lancedb),
        "question": RunnablePassthrough()
    }
    | rag_prompt
    | llm
    | StrOutputParser()
)

# Streamlit UI
st.set_page_config(page_title="LangChain RAG Chatbot", layout="centered")
st.title("💬 LangChain RAG Chatbot")

# User Input
user_query = st.text_input("Ask a question:", "")

# Optional toggle for context chunks
show_chunks = st.checkbox("Show retrieved document chunks")

# Process Query
if user_query:
    with st.spinner("Generating answer..."):
        try:
            response = rag_chain.invoke(user_query)
            st.subheader("🧠 Chatbot Response:")
            st.markdown(response)

            if show_chunks:
                chunks = get_chunks(user_query)
                st.subheader("📚 Retrieved Chunks:")
                for i, chunk in enumerate(chunks, 1):
                    with st.expander(f"Chunk {i}"):
                        st.write(chunk)

        except Exception as e:
            st.error(f"An error occurred: {e}")
