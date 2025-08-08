from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.responses import FileResponse
from fastapi import Query, HTTPException

from chat import chatbot_interaction

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*","http://localhost:8080/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(request: QueryRequest):
    try:
        response = chatbot_interaction(request.question)
        return {"answer": response}
    except Exception as e:
        return {"error": str(e)}

@app.get("/get_pdf")
def get_pdf(filename: str = Query(...)):
    file_path = os.path.join("pdf_gen", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(path=file_path, media_type='application/pdf', filename=filename)

