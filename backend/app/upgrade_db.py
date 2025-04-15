from database import get_db
from datetime import datetime
from bson import ObjectId

def upgrade_database():
    try:
        db = get_db()
        current_time = datetime.utcnow()
        
        # Update expenses
        result = db.expenses.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        print(f"Updated {result.modified_count} expenses")
        
        # Update incomes
        result = db.incomes.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        print(f"Updated {result.modified_count} incomes")
        
        # Update goals
        result = db.goals.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        print(f"Updated {result.modified_count} goals")
        
        # Update goal progress
        result = db.goal_progress.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        print(f"Updated {result.modified_count} goal progress records")
        
        print("Database upgrade completed successfully")
        
    except Exception as e:
        print(f"Error upgrading database: {e}")
        raise e

if __name__ == "__main__":
    upgrade_database()