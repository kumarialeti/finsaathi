from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.graphs.financial_graph import financial_graph
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI(title="FinSaathi AI Service")

from typing import Optional

class AnalyzeRequest(BaseModel):
    user_id: str
    message: str
    language: Optional[str] = "en"

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fin-saathi-ai"}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        lang_instruction = ""
        if req.language == "hi":
            lang_instruction = "The user has selected Hindi as their UI language. You MUST respond in Hindi."
        elif req.language == "te":
            lang_instruction = "The user has selected Telugu as their UI language. You MUST respond in Telugu."
        else:
            lang_instruction = "IMPORTANT: You MUST respond in the same language that the user uses in their message. For example, if the user speaks Hindi, respond in Hindi. If they speak Telugu, respond in Telugu. If they speak English, respond in English."

        system_prompt = f"""You are FinSaathi, a helpful financial assistant. The user's ID is {req.user_id}. 
You must ALWAYS use the available tools to fetch actual financial data (transactions or document text) before answering questions about their finances or uploaded documents.
NEVER invent transactions or give generic educational answers when asked about the user's data or statements.
If a user asks for a summary of their statement, you MUST use the get_document_content tool to read their document, extract the actual amounts/period/transactions, and format it clearly in Markdown using headings (##), bold (**text**), and bullet points.
{lang_instruction}"""
        inputs = {
            "messages": [
                SystemMessage(content=system_prompt),
                HumanMessage(content=req.message)
            ]
        }
        
        result = financial_graph.invoke(inputs)
        final_message = result["messages"][-1].content
        
        return {
            "reply": final_message,
            "language": "en"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

