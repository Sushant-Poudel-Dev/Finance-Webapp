from pydantic import BaseModel
from datetime import datetime

class ExpenseCreate(BaseModel):
    name: str
    amount: int
    date: str  # Now expecting YYYY-MM-DD HH:mm format

class Expense(BaseModel):
    id: int
    name: str
    amount: int
    date: str  # Format YYYY-MM-DD HH:mm
    created_at: datetime
    
    class Config:
        orm_mode = True

class ExpenseInDB(BaseModel):
    type: str = "Expense"
    description: str = 'Track your expenses'
    id: str
    name: str
    amount: int
    date: str  # Format YYYY-MM-DD HH:mm
    created_at: datetime
    
    class Config:
        orm_mode = True