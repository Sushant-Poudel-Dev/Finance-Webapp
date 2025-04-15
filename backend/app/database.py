# app/database.py

from pymongo import MongoClient
from app.config import settings

# MongoDB connection
client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

def init_db():
    if 'expenses' not in db.list_collection_names():
        db.create_collection('expenses')
    
    if 'incomes' not in db.list_collection_names():
        db.create_collection('incomes')
    
    if 'savings' not in db.list_collection_names():
        db.create_collection('savings')
        
    if 'goals' not in db.list_collection_names():
        db.create_collection('goals')
    
def get_db():
    return db
