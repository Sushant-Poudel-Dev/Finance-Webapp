from app.models.income import Income, IncomeInDB
from app.database import get_db
from fastapi import APIRouter
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from fastapi import HTTPException

router = APIRouter()

class IncomeCreate(BaseModel):
    name: str
    amount: int
    date: str  # Now expecting YYYY-MM-DD HH:mm format
    
@router.post("/", response_model=IncomeInDB)
async def create_income(income: IncomeCreate):
    try:
        print(f"Received data: {income}")
        parsed_date = datetime.strptime(income.date, "%Y-%m-%d %H:%M")
        current_time = datetime.utcnow()
        
        db = get_db()
        income_dict = {
            "name": income.name,
            "amount": income.amount,
            "date": parsed_date,
            "created_at": current_time
        }
        result = db.incomes.insert_one(income_dict)
        income_dict["id"] = str(result.inserted_id)
        income_dict["date"] = parsed_date.strftime("%Y-%m-%d %H:%M")  # Format without seconds
        
        return IncomeInDB(**income_dict)

    except ValueError as ve:
        print(f"ValueError: {ve}")
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD HH:mm")
    except Exception as e:
        print(f"Error creating income: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=list[IncomeInDB])
async def get_all_incomes():
    db = get_db()
    # Sort by date in descending order (newest first)
    incomes = list(db.incomes.find().sort("date", -1))
    for income in incomes:
        income["id"] = str(income["_id"])
        del income["_id"]
        if isinstance(income["date"], datetime):
            # Format with hours and minutes only
            income["date"] = income["date"].strftime("%Y-%m-%d %H:%M")
    return [IncomeInDB(**income) for income in incomes]

@router.get("/{income_id}", response_model=IncomeInDB)
async def get_income_by_id(income_id: str):
    db = get_db()
    income = db.incomes.find_one({"_id": ObjectId(income_id)})
    if income:
        income["id"] = str(income["_id"])
        del income["_id"]
        if isinstance(income["date"], datetime):
            # Format with hours and minutes only
            income["date"] = income["date"].strftime("%Y-%m-%d %H:%M")
        return IncomeInDB(**income)
    return {"error": "Income not found"}

@router.delete("/{id}")
async def delete_income(id: str):
    db = get_db()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId")
    result = db.incomes.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"message": "Income deleted successfully"}

