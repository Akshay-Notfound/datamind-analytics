from fastapi import APIRouter, HTTPException, Path, Query
from database.mongodb import get_database
from bson import ObjectId
import pandas as pd
import json
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional

router = APIRouter(
    prefix="/charts",
    tags=["charts"]
)

@router.get("/{dataset_id}/generate")
async def generate_chart(
    dataset_id: str,
    chart_type: str = Query(..., description="Type of chart (e.g., line, bar, pie, scatter, histogram, heatmap, treemap, waterfall, funnel, radar)"),
    x_col: Optional[str] = Query(None, description="Column for X-axis"),
    y_col: Optional[str] = Query(None, description="Column for Y-axis"),
    z_col: Optional[str] = Query(None, description="Column for Z-axis or Size/Color"),
):
    """
    Generate an interactive Plotly chart JSON representation.
    """
    db = get_database()
    try:
        dataset = await db.datasets.find_one({"_id": ObjectId(dataset_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Dataset ID format")

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    preview_data = dataset.get("summary", {}).get("preview", [])
    if not preview_data:
        raise HTTPException(status_code=400, detail="No data available in dataset preview to chart")

    df = pd.DataFrame(preview_data)

    fig = None
    chart_type = chart_type.lower()

    try:
        # --- Basic Charts ---
        if chart_type == "line":
            fig = px.line(df, x=x_col, y=y_col, title=f"Line Chart: {y_col} over {x_col}")
        elif chart_type == "bar":
            fig = px.bar(df, x=x_col, y=y_col, title=f"Bar Chart: {y_col} by {x_col}")
        elif chart_type == "horizontal bar":
            fig = px.bar(df, x=y_col, y=x_col, orientation='h', title=f"Horizontal Bar: {x_col} by {y_col}")
        elif chart_type == "pie":
            fig = px.pie(df, names=x_col, values=y_col, title=f"Pie Chart: {y_col} by {x_col}")
        elif chart_type == "area":
            fig = px.area(df, x=x_col, y=y_col, title=f"Area Chart: {y_col} over {x_col}")
        
        # --- Statistical Charts ---
        elif chart_type == "histogram":
            fig = px.histogram(df, x=x_col, title=f"Histogram of {x_col}")
        elif chart_type == "box":
            fig = px.box(df, x=x_col, y=y_col, title=f"Box Plot: {y_col} by {x_col}")
        elif chart_type == "violin":
            fig = px.violin(df, x=x_col, y=y_col, box=True, points="all", title=f"Violin Plot: {y_col} by {x_col}")
        elif chart_type == "strip":
            fig = px.strip(df, x=x_col, y=y_col, title=f"Strip Plot: {y_col} by {x_col}")
        
        # --- Relationship Charts ---
        elif chart_type == "scatter":
            fig = px.scatter(df, x=x_col, y=y_col, color=z_col, title=f"Scatter: {y_col} vs {x_col}")
        elif chart_type == "bubble":
            fig = px.scatter(df, x=x_col, y=y_col, size=z_col, color=z_col, title=f"Bubble Chart")
        elif chart_type == "density contour":
            fig = px.density_contour(df, x=x_col, y=y_col, title=f"Density Contour: {y_col} vs {x_col}")

        # --- Comparison Charts ---
        elif chart_type == "grouped bar":
            fig = px.bar(df, x=x_col, y=y_col, color=z_col, barmode='group', title=f"Grouped Bar")
        elif chart_type == "stacked bar":
            fig = px.bar(df, x=x_col, y=y_col, color=z_col, barmode='stack', title=f"Stacked Bar")

        # --- Correlation Charts ---
        elif chart_type == "heatmap":
            numerical_df = df.select_dtypes(include='number')
            if numerical_df.empty:
                raise ValueError("No numerical columns for heatmap")
            corr = numerical_df.corr()
            fig = px.imshow(corr, text_auto=True, title="Correlation Matrix Heatmap")
            
        # --- Hierarchical Charts ---
        elif chart_type == "treemap":
            fig = px.treemap(df, path=[x_col] if x_col else df.columns[:2].tolist(), values=y_col, title="Treemap")
        elif chart_type == "sunburst":
            fig = px.sunburst(df, path=[x_col] if x_col else df.columns[:2].tolist(), values=y_col, title="Sunburst Chart")
            
        # --- Advanced Charts ---
        elif chart_type == "waterfall":
            # Very basic waterfall approximation
            if x_col and y_col:
                fig = go.Figure(go.Waterfall(
                    x = df[x_col].tolist(),
                    y = df[y_col].tolist(),
                    measure = ["relative"] * len(df)
                ))
                fig.update_layout(title="Waterfall Chart")
            else:
                raise ValueError("X and Y columns required for Waterfall")
        elif chart_type == "funnel":
            if x_col and y_col:
                fig = px.funnel(df, x=y_col, y=x_col, title="Funnel Chart")
            else:
                raise ValueError("X and Y columns required for Funnel")
        elif chart_type == "radar":
            if x_col and y_col:
                fig = px.line_polar(df, r=y_col, theta=x_col, line_close=True, title="Radar Chart")
            else:
                raise ValueError("X and Y columns required for Radar")
        elif chart_type == "3d scatter":
            if x_col and y_col and z_col:
                fig = px.scatter_3d(df, x=x_col, y=y_col, z=z_col, title="3D Scatter Plot")
            else:
                raise ValueError("X, Y, and Z columns required for 3D Scatter")
        elif chart_type == "3d surface":
            raise ValueError("3D Surface requires matrix data which isn't directly supported via this basic UI")
        else:
            # Fallback
            raise ValueError(f"Chart type '{chart_type}' is not yet fully mapped or supported.")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating chart: {str(e)}")

    if fig:
        # Make layout darker for the UI
        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
        )
        return json.loads(fig.to_json())
    else:
        raise HTTPException(status_code=400, detail="Could not generate chart with provided parameters")
