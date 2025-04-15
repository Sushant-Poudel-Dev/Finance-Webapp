from pydantic import BaseModel
from datetime import datetime

class Goal(BaseModel):
    id: int
    name: str
    amount: int
    current_amount: int = 0
    date: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class GoalInDB(BaseModel):
    id: str
    name: str
    amount: int
    current_amount: int = 0
    date: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class GoalProgress(BaseModel):
    goal_id: str
    amount: int
    date: str
    created_at: datetime = None
    
    class Config:
        orm_mode = True

class GoalProgressInDB(BaseModel):
    id: str
    goal_id: str
    amount: int
    date: str
    created_at: datetime
    
    class Config:
        orm_mode = True