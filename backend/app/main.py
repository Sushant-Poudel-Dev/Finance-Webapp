from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import pandas as pd
from datetime import datetime
import tempfile
import os
from app.routes import expenseRoute
from app.routes import incomeRoute
from app.routes import savingRoute
from app.routes import goalRoute
from app.database import init_db, get_db
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Changed from single origin to array
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Required for file download
)

@app.on_event("startup")
def startup_db():
    init_db()

@app.get("/export/data", tags=["Export"])
async def export_data():
    try:
        db = get_db()
        
        # Get all data and format dates
        def format_records(records):
            formatted = []
            for record in records:
                if isinstance(record.get('date'), datetime):
                    record['date'] = record['date'].strftime('%Y-%m-%d')
                if isinstance(record.get('created_at'), datetime):
                    record['created_at'] = record['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                formatted.append(record)
            return formatted

        expenses = format_records(list(db.expenses.find({}, {'_id': 0})) or [])
        incomes = format_records(list(db.incomes.find({}, {'_id': 0})) or [])
        goals = format_records(list(db.goals.find({}, {'_id': 0})) or [])
        
        # Create temporary file
        temp_dir = tempfile.mkdtemp()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"financial_data_{timestamp}.xlsx"
        filepath = os.path.join(temp_dir, filename)
        
        # Create Excel file with custom column widths
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            for data, sheet_name, columns in [
                (expenses, 'Expenses', ['date', 'name', 'amount', 'created_at']),
                (incomes, 'Incomes', ['date', 'name', 'amount', 'created_at']),
                (goals, 'Goals', ['date', 'name', 'amount', 'current_amount', 'created_at'])
            ]:
                df = pd.DataFrame(data) if data else pd.DataFrame(columns=columns)
                # Convert date column to datetime if it exists
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
                if 'created_at' in df.columns:
                    df['created_at'] = pd.to_datetime(df['created_at']).dt.strftime('%Y-%m-%d %H:%M:%S')
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                
                # Auto-adjust column widths
                worksheet = writer.sheets[sheet_name]
                for idx, col in enumerate(df.columns):
                    max_length = max(
                        df[col].astype(str).apply(len).max(),
                        len(col)
                    ) + 2
                    worksheet.column_dimensions[chr(65 + idx)].width = max_length
        
        # Return file with proper headers
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Access-Control-Expose-Headers': 'Content-Disposition'
        }
        
        return FileResponse(
            filepath,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=filename,
            headers=headers
        )
            
    except Exception as e:
        print(f"Export error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error exporting data: {str(e)}"
        )

app.include_router(expenseRoute.router, prefix="/expense", tags=["Expense"])
app.include_router(incomeRoute.router, prefix="/income", tags=["Income"])
app.include_router(savingRoute.router, prefix="/saving", tags=["Saving"])
app.include_router(goalRoute.router, prefix="/goal", tags=["Goal"])