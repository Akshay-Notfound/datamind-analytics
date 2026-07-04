from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.mongodb import get_database
from bson import ObjectId
import datetime
from typing import Dict, Any, Optional

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

class DashboardCreateRequest(BaseModel):
    dataset_id: str
    config: Dict[str, Any]

@router.post("/create")
async def create_dashboard(request: DashboardCreateRequest):
    """
    Saves a dashboard configuration tied to a specific dataset and returns a shareable link ID.
    """
    db = get_database()
    
    try:
        # Verify dataset exists
        dataset = await db.datasets.find_one({"_id": ObjectId(request.dataset_id)})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Create dashboard entry
        dashboard_doc = {
            "dataset_id": request.dataset_id,
            "config": request.config,
            "created_at": datetime.datetime.utcnow(),
        }
        
        result = await db.dashboards.insert_one(dashboard_doc)
        share_id = str(result.inserted_id)
        
        # Also update the dataset to link to this dashboard (optional)
        await db.datasets.update_one(
            {"_id": ObjectId(request.dataset_id)},
            {"$set": {"dashboard_config": request.config, "share_id": share_id}}
        )
        
        return {"message": "Dashboard created successfully", "share_id": share_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating dashboard: {str(e)}")

@router.get("/{share_id}")
async def get_dashboard(share_id: str):
    """
    Retrieves a dashboard and its associated dataset summary for public viewing.
    """
    db = get_database()
    try:
        dashboard = await db.dashboards.find_one({"_id": ObjectId(share_id)})
        if not dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found")
            
        dataset = await db.datasets.find_one({"_id": ObjectId(dashboard["dataset_id"])})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        # Clean up ObjectIds for JSON serialization
        dataset_summary = dataset.get("summary", {})
        dashboard["_id"] = str(dashboard["_id"])
        
        return {
            "dashboard": dashboard,
            "summary": dataset_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard: {str(e)}")

