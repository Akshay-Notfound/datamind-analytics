from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from services.data_processing import process_uploaded_file
from database.mongodb import get_database
from bson import ObjectId
import datetime

router = APIRouter(
    prefix="/data",
    tags=["data_ingestion"]
)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to upload a dataset and get an immediate EDA summary and Data Quality Score.
    """
    try:
        contents = await file.read()
        df, summary = process_uploaded_file(contents, file.filename)
        
        db = get_database()
        
        # Save dataset summary and preview to DB
        dataset_doc = {
            "filename": file.filename,
            "upload_date": datetime.datetime.utcnow(),
            "summary": summary,
            "dashboard_config": None # Will be populated when dashboard is created
        }
        
        result = await db.datasets.insert_one(dataset_doc)
        dataset_id = str(result.inserted_id)
        
        # Return summary along with dataset_id
        summary["dataset_id"] = dataset_id
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.get("/datasets")
async def get_datasets():
    """Get all uploaded datasets"""
    db = get_database()
    datasets = []
    async for d in db.datasets.find({}, {"summary.preview": 0, "summary.correlation_matrix": 0}).sort("upload_date", -1).limit(20):
        datasets.append({
            "id": str(d["_id"]),
            "filename": d["filename"],
            "upload_date": d["upload_date"],
            "rows": d.get("summary", {}).get("rows", 0),
            "columns": d.get("summary", {}).get("columns", 0),
            "numerical_columns": d.get("summary", {}).get("numerical_columns", []),
            "categorical_columns": d.get("summary", {}).get("categorical_columns", [])
        })
    return datasets

