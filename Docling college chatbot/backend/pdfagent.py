from langchain.prompts import ChatPromptTemplate
from custom_wrapper import OpenRouterChat
import lancedb
from sentence_transformers import SentenceTransformer
from lancedb.pydantic import LanceModel,Vector
from lancedb.embeddings import get_registry
import os

HUGGING_FACE_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
func = get_registry().get("sentence-transformers").create(name=HUGGING_FACE_EMBEDDING_MODEL)

model = SentenceTransformer("all-MiniLM-L6-v2")

DB_PATH = "data/lancedb"
db = lancedb.connect(DB_PATH)


def search_pdf(query: str, k: int = 1,TABLE_NAME="pdfdetails"):
    db = lancedb.connect(DB_PATH)
    table = db.open_table(TABLE_NAME)

    vector = model.encode(query).tolist()
    results = table.search(vector).limit(k).to_pandas()

    if results.empty:
        return None
    return {
        "name": results.iloc[0]["name"],
        "path": results.iloc[0]["path"],
        "summary": results.iloc[0]["summary"]
    }

def pdfsorno(query,names=[i for i in os.listdir("pdf_gen")]):
    template = """
    You are a smart assistant embedded inside a college chatbot.
Your task is to determine whether the following user query needs information that is typically found in PDF documents, in below list:
{pdf_names}

Respond with only **"yes"** if the user’s query is likely to need such a PDF document. Respond with **"no"** otherwise.

Query: {query}

Answer:
"""

    prompt = ChatPromptTemplate.from_template(template)
    llm = OpenRouterChat(
        api_key="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",
        model="mistralai/mistral-7b-instruct:free",
        temperature=0.2,
    )

    chain = prompt | llm
    result = chain.invoke({
        "query":query,
        "pdf_names":names
    })
    raw = result.content
    print(raw)
    if "Yes" in raw:
        return search_pdf(query)
    return None


'''print(pdfsorno("i need campus map of kpr"))'''


