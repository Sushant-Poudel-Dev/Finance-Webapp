from pydantic import BaseModel
from datetime import datetime

class Saving(BaseModel):
    id: int
    name: str
    amount: float
    date: str
    
    class Config:
        orm_mode = True
    
class SavingInDB(BaseModel):
    id: str
    name: str
    amount: float
    date: str
        
    class Config:
        orm_mode = True