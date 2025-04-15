from pydantic import BaseModel
from datetime import datetime

class Income(BaseModel):
    id: int
    name: str
    amount: int
    date: str  # Format YYYY-MM-DD HH:mm
    created_at: datetime
    
    class Config:
        orm_mode = True

class IncomeInDB(BaseModel):
    type: str = "Income"
    description: str = 'Track your income'
    id: str
    name: str
    amount: int
    date: str  # Format YYYY-MM-DD HH:mm
    created_at: datetime
    
    class Config:
        orm_mode = True