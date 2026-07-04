import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import io

def process_uploaded_file(file_contents: bytes, filename: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Reads a file into a pandas DataFrame and generates an initial EDA summary.
    """
    if filename.endswith(".csv"):
        try:
            df = pd.read_csv(io.BytesIO(file_contents), sep=None, engine='python')
        except Exception:
            df = pd.read_csv(io.BytesIO(file_contents))
            
        # If it failed to split columns and it looks like a semicolon separated file
        if df.shape[1] == 1 and ';' in str(df.columns[0]):
            df = pd.read_csv(io.BytesIO(file_contents), sep=';')
    elif filename.endswith(".txt"):
        try:
            df = pd.read_csv(io.BytesIO(file_contents), sep=None, engine='python')
        except Exception:
            df = pd.read_csv(io.BytesIO(file_contents))
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_contents))
    elif filename.endswith(".json"):
        df = pd.read_json(io.BytesIO(file_contents))
    elif filename.endswith(".sql"):
        lines = file_contents.decode('utf-8', errors='ignore').splitlines()
        df = pd.DataFrame({'sql_content': lines})
    else:
        raise ValueError(f"Unsupported file type: {filename}")
    
    # Calculate Data Quality Score
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isnull().sum().sum()
    duplicate_rows = df.duplicated().sum()
    
    missing_penalty = (missing_cells / total_cells) * 50 if total_cells > 0 else 0
    duplicate_penalty = (duplicate_rows / df.shape[0]) * 50 if df.shape[0] > 0 else 0
    
    quality_score = max(0.0, 100.0 - missing_penalty - duplicate_penalty)
    
    # Generate EDA stats
    numerical_cols = df.select_dtypes(include=['number']).columns.tolist()
    correlation_matrix = df[numerical_cols].corr().replace({np.nan: None}).to_dict() if numerical_cols else {}
    
    categorical_cols = df.select_dtypes(include=['object', 'category', 'bool']).columns.tolist()
    categorical_summaries = {}
    for col in categorical_cols:
        # Get top 10 most frequent categories
        counts = df[col].value_counts().head(10).to_dict()
        categorical_summaries[col] = counts

    # Basic descriptive stats
    describe_dict = df.describe(include='all').replace({np.nan: None}).to_dict()
    
    # Sample preview (first 100 rows max) for the frontend grid
    preview_data = df.head(100).fillna("").to_dict(orient="records")
    
    summary = {
        "filename": filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "quality_score": round(quality_score, 2),
        "missing_values": int(missing_cells),
        "duplicate_rows": int(duplicate_rows),
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols,
        "categorical_summaries": categorical_summaries,
        "correlation_matrix": correlation_matrix,
        "descriptive_statistics": describe_dict,
        "preview": preview_data,
        "column_types": {col: str(dtype) for col, dtype in df.dtypes.items()}
    }
    
    return df, summary
