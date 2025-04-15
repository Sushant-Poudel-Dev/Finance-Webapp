from app.models.saving import Saving, SavingInDB
from app.database import get_db
from fastapi import APIRouter
from bson import ObjectId # to work with MongoDB ObjectId and not str
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=SavingInDB)
async def create_saving(
    name: str,
    amount: float,
    date: str, 
):
    try:
        
        parsed_date = datetime.strptime(date, "%Y-%m-%d")
        
        db = get_db()
        
        saving_dict = {
            "name": name,
            "amount": amount,
            "date": parsed_date,
        }
        
        result = db.savings.insert_one(saving_dict)
        saving_dict["id"] = str(result.inserted_id)
        return SavingInDB(**saving_dict)
    
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD."}
    except Exception as e:
        print(f"Error connecting to database: {e}")
        
@router.get("/", response_model=list[SavingInDB])
async def get_all_savings():
    db = get_db()
    savings = list(db.savings.find())
    for saving in savings:
        saving["id"] = str(saving["_id"])
        del saving["_id"]
    return [SavingInDB(**saving) for saving in savings]

@router.get("/{saving_id}", response_model=SavingInDB)
async def get_saving_by_id(saving_id: str):
    db = get_db()
    saving = db.savings.find_one({"_id": ObjectId(saving_id)})
    if saving:
        saving["id"] = str(saving["_id"])
        del saving["_id"]
        return SavingInDB(**saving)
    return {"error": "saving not found"}