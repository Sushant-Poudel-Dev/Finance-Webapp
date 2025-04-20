from app.models.goal import Goal, GoalInDB, GoalProgress, GoalProgressInDB, GoalCreate
from app.database import get_db
from fastapi import APIRouter, HTTPException
from bson import ObjectId 
from datetime import datetime
from pydantic import BaseModel 

router = APIRouter()

@router.post("/", response_model=GoalInDB)
async def create_goal(goal: GoalCreate):
    try:
        parsed_date = datetime.strptime(goal.date, "%Y-%m-%d")
        current_time = datetime.utcnow()
        db = get_db()
        goal_dict = {
            "name": goal.name,
            "amount": goal.amount,
            "date": parsed_date,
            "current_amount": 0,
            "created_at": current_time
        }
        result = db.goals.insert_one(goal_dict)
        goal_dict["id"] = str(result.inserted_id)
        goal_dict["date"] = parsed_date.strftime("%Y-%m-%d")
        return GoalInDB(**goal_dict)

    except ValueError as ve:
        print(f"ValueError: {ve}") 
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    except Exception as e:
        print(f"Error creating goal: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

@router.get("/", response_model=list[GoalInDB])
async def get_all_goals():
    db = get_db()
    
    goals = list(db.goals.find())
    for goal in goals:
        goal["id"] = str(goal["_id"])
        del goal["_id"]
        if isinstance(goal["date"], datetime):
            goal["date"] = goal["date"].strftime("%Y-%m-%d")
    return [GoalInDB(**goal) for goal in goals]

@router.get("/{goal_id}", response_model=GoalInDB)
async def get_goal_by_id(goal_id: str):
    db = get_db()
    
    goal = db.goals.find_one({"_id": ObjectId(goal_id)})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal["id"] = str(goal["_id"])
    del goal["_id"]
    if isinstance(goal["date"], datetime):
        goal["date"] = goal["date"].strftime("%Y-%m-%d")
    
    return GoalInDB(**goal)

@router.delete("/{id}")
async def delete_goal(id: str):
    db = get_db()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId")
    
    result = db.goals.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {"message": "Goal deleted successfully"}

@router.post("/{goal_id}/progress", response_model=GoalProgressInDB)
async def add_goal_progress(goal_id: str, progress: GoalProgress):
    try:
        db = get_db()
        goal = db.goals.find_one({"_id": ObjectId(goal_id)})
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        new_amount = goal.get("current_amount", 0) + progress.amount
        if new_amount > goal["amount"]:
            raise HTTPException(status_code=400, detail="Progress amount exceeds goal target")            
        
        current_time = datetime.utcnow()
        progress_dict = {
            "goal_id": goal_id,
            "amount": progress.amount,
            "date": datetime.strptime(progress.date, "%Y-%m-%d"),
            "created_at": current_time
        }
        result = db.goal_progress.insert_one(progress_dict)
        db.goals.update_one(
            {"_id": ObjectId(goal_id)},
            {"$set": {"current_amount": new_amount}}
        )
        progress_dict["id"] = str(result.inserted_id)
        progress_dict["date"] = progress_dict["date"].strftime("%Y-%m-%d")        
        return GoalProgressInDB(**progress_dict)
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

