from langchain.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.services.database import get_db_session

class GetTransactionsInput(BaseModel):
    user_id: str = Field(..., description="The ID of the user requesting transactions.")
    limit: int = Field(10, description="Maximum number of transactions to retrieve. Default is 10.")
    category: Optional[str] = Field(None, description="Optional category to filter transactions by (e.g., 'Food', 'Shopping').")
    days: Optional[int] = Field(None, description="Retrieve transactions from the last N days.")
    document_id: Optional[str] = Field(None, description="Optional document ID to only query transactions from a specific uploaded document.")

@tool("get_transactions", args_schema=GetTransactionsInput)
def get_transactions(user_id: str, limit: int = 10, category: Optional[str] = None, days: Optional[int] = None, document_id: Optional[str] = None) -> str:
    """Retrieve recent transactions for a user, optionally filtered by category, date, or document."""
    session = get_db_session()
    try:
        query_str = "SELECT id, amount, transaction_type, merchant, category, description, date FROM \"Transaction\" WHERE user_id = :user_id"
        params = {"user_id": user_id}
        
        if document_id:
            query_str += " AND document_id = :document_id"
            params["document_id"] = document_id
            
        if category:
            query_str += " AND category = :category"
            params["category"] = category
            
        if days is not None:
            cutoff = datetime.utcnow() - timedelta(days=days)
            query_str += " AND date >= :cutoff"
            params["cutoff"] = cutoff
            
        query_str += " ORDER BY date DESC LIMIT :limit"
        params["limit"] = limit

        result = session.execute(text(query_str), params)
        transactions = []
        for row in result:
            transactions.append({
                "id": str(row[0]),
                "amount": float(row[1]),
                "type": row[2],
                "merchant": row[3],
                "category": row[4],
                "description": row[5],
                "date": row[6].isoformat() if row[6] else None
            })
        import json
        return json.dumps(transactions) if transactions else "No transactions found."
    except Exception as e:
        return json.dumps([{"error": str(e)}])
    finally:
        session.close()

class CalculateSpendInput(BaseModel):
    user_id: str = Field(..., description="The ID of the user.")
    category: Optional[str] = Field(None, description="Calculate spend only for this specific category. If null, calculates total spend.")
    month: Optional[int] = Field(None, description="Month (1-12) to calculate spend for. Defaults to current month.")
    year: Optional[int] = Field(None, description="Year to calculate spend for. Defaults to current year.")

@tool("calculate_spend", args_schema=CalculateSpendInput)
def calculate_spend(user_id: str, category: Optional[str] = None, month: Optional[int] = None, year: Optional[int] = None) -> str:
    """Calculate total expenses for a user, optionally filtered by category and specific month/year."""
    session = get_db_session()
    try:
        now = datetime.utcnow()
        calc_month = month or now.month
        calc_year = year or now.year
        
        query_str = """
            SELECT SUM(amount) as total 
            FROM "Transaction" 
            WHERE user_id = :user_id 
              AND transaction_type = 'EXPENSE'
              AND EXTRACT(MONTH FROM date) = :month 
              AND EXTRACT(YEAR FROM date) = :year
        """
        params = {"user_id": user_id, "month": calc_month, "year": calc_year}
        
        if category:
            query_str += " AND category = :category"
            params["category"] = category
            
        result = session.execute(text(query_str), params).scalar()
        
        import json
        return json.dumps({
            "total_spend": float(result) if result else 0.0,
            "category": category or "All",
            "period": f"{calc_month}/{calc_year}"
        })
    except Exception as e:
        import json
        return json.dumps({"error": str(e)})
    finally:
        session.close()

class GetBudgetsInput(BaseModel):
    user_id: str = Field(..., description="The ID of the user.")
    month: Optional[int] = Field(None, description="Month (1-12) to get budgets for. Defaults to current month.")
    year: Optional[int] = Field(None, description="Year to get budgets for. Defaults to current year.")

@tool("get_budgets", args_schema=GetBudgetsInput)
def get_budgets(user_id: str, month: Optional[int] = None, year: Optional[int] = None) -> str:
    """Retrieve budgets for a specific month and year, including the amount spent."""
    session = get_db_session()
    try:
        now = datetime.utcnow()
        calc_month = month or now.month
        calc_year = year or now.year
        
        query_str = """
            SELECT b.category, b.amount, COALESCE(SUM(t.amount), 0) as spent
            FROM "Budget" b
            LEFT JOIN "Transaction" t 
              ON b.user_id = t.user_id 
              AND b.category = t.category 
              AND t.transaction_type = 'EXPENSE'
              AND EXTRACT(MONTH FROM t.date) = :month 
              AND EXTRACT(YEAR FROM t.date) = :year
            WHERE b.user_id = :user_id 
              AND b.month = :month 
              AND b.year = :year
            GROUP BY b.category, b.amount
        """
        params = {"user_id": user_id, "month": calc_month, "year": calc_year}
        
        result = session.execute(text(query_str), params)
        budgets = []
        for row in result:
            budgets.append({
                "category": row[0],
                "limit": float(row[1]),
                "spent": float(row[2])
            })
            
        import json
        return json.dumps({
            "period": f"{calc_month}/{calc_year}",
            "budgets": budgets
        })
    except Exception as e:
        import json
        return json.dumps({"error": str(e)})
    finally:
        session.close()

class GetMonthlySummaryInput(BaseModel):
    user_id: str = Field(..., description="The ID of the user.")
    month: Optional[int] = Field(None, description="Month (1-12) to summarize. Defaults to current month.")
    year: Optional[int] = Field(None, description="Year to summarize. Defaults to current year.")

@tool("get_monthly_summary", args_schema=GetMonthlySummaryInput)
def get_monthly_summary(user_id: str, month: Optional[int] = None, year: Optional[int] = None) -> str:
    """Get total income, total expenses, and balance for a given month."""
    session = get_db_session()
    try:
        now = datetime.utcnow()
        calc_month = month or now.month
        calc_year = year or now.year
        
        query_str = """
            SELECT transaction_type, SUM(amount) as total
            FROM "Transaction" 
            WHERE user_id = :user_id 
              AND EXTRACT(MONTH FROM date) = :month 
              AND EXTRACT(YEAR FROM date) = :year
            GROUP BY transaction_type
        """
        params = {"user_id": user_id, "month": calc_month, "year": calc_year}
        
        result = session.execute(text(query_str), params)
        summary = {"income": 0.0, "expense": 0.0}
        for row in result:
            if row[0] == 'INCOME':
                summary["income"] = float(row[1])
            elif row[0] == 'EXPENSE':
                summary["expense"] = float(row[1])
                
        summary["balance"] = summary["income"] - summary["expense"]
        summary["period"] = f"{calc_month}/{calc_year}"
        
        import json
        return json.dumps(summary)
    except Exception as e:
        import json
        return json.dumps({"error": str(e)})
    finally:
        session.close()

class GetDocumentContentInput(BaseModel):
    document_id: str = Field(..., description="The ID of the document to read.")

@tool("get_document_content", args_schema=GetDocumentContentInput)
def get_document_content(document_id: str) -> str:
    """Retrieve the raw text content of an uploaded financial document."""
    session = get_db_session()
    try:
        query_str = "SELECT raw_content FROM \"FinancialDocument\" WHERE id = :document_id"
        result = session.execute(text(query_str), {"document_id": document_id}).scalar()
        if result:
            return result
        return "Document not found or no raw content available."
    except Exception as e:
        return f"Error retrieving document: {str(e)}"
    finally:
        session.close()

FINANCIAL_TOOLS = [get_transactions, calculate_spend, get_budgets, get_monthly_summary, get_document_content]

