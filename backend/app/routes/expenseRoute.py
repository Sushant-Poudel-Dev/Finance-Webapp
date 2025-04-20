from app.models.expense import Expense, ExpenseInDB, ExpenseCreate
from app.database import get_db
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ExpenseInDB)
async def create_expense(expense: ExpenseCreate):
    try:
        parsed_date = datetime.strptime(expense.date, "%Y-%m-%d %H:%M")
        current_time = datetime.utcnow()
        db = get_db()
        expense_dict = {
            "name": expense.name,
            "amount": expense.amount,
            "date": parsed_date,
            "created_at": current_time
        }
        result = db.expenses.insert_one(expense_dict)
        expense_dict["id"] = str(result.inserted_id)
        expense_dict["date"] = parsed_date.strftime("%Y-%m-%d %H:%M")  # Format without seconds
        return ExpenseInDB(**expense_dict)

    except ValueError as ve:
        print(f"ValueError: {ve}")
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD HH:mm")
    except Exception as e:
        print(f"Error creating expense: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
        
@router.get("/", response_model=list[ExpenseInDB])
async def get_all_expenses():
    db = get_db()
    # Sort by date in descending order (newest first)
    expenses = list(db.expenses.find().sort("date", -1))
    for expense in expenses:
        expense["id"] = str(expense["_id"])
        del expense["_id"]
        if isinstance(expense["date"], datetime):
            # Format with hours and minutes only
            expense["date"] = expense["date"].strftime("%Y-%m-%d %H:%M")
    return [ExpenseInDB(**expense) for expense in expenses]

@router.get("/{expense_id}", response_model=ExpenseInDB)
async def get_expense_by_id(expense_id: str):
    db = get_db()
    expense = db.expenses.find_one({"_id": ObjectId(expense_id)})
    if expense:
        expense["id"] = str(expense["_id"])
        del expense["_id"]
        if isinstance(expense["date"], datetime):
            # Format with hours and minutes only
            expense["date"] = expense["date"].strftime("%Y-%m-%d %H:%M")
        return ExpenseInDB(**expense)
    return {"error": "Expense not found"}

@router.delete("/{id}")
async def delete_expense(id: str):
    db = get_db()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId")
    result = db.expenses.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}