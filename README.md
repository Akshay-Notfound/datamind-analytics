# DataMind AI

DataMind AI is a comprehensive Business Intelligence platform designed to automate data analysis and visualization. Built with a modern React/Next.js frontend and a robust Python backend, it empowers users to explore data, generate interactive dashboards, and uncover valuable insights without needing complex coding skills.

## Architecture & Data Flow

Below is the high-level data flow diagram illustrating how data moves through the DataMind AI platform:

```mermaid
graph TD
    %% User Interaction
    User[User Interface] -->|1. Uploads Data / CSV| UI(Next.js Frontend)
    User -->|4. Interacts with Slicers/Charts| UI
    
    %% Frontend to Backend
    UI -->|2. Sends File / API Request| Backend(FastAPI Backend)
    
    %% Backend Processing
    Backend -->|3a. Processes Data| DataProcessing[Data Processing Engine <br/> pandas/numpy]
    Backend -->|3b. Generates Visualizations| ChartEngine[Visualization Engine <br/> Plotly/Matplotlib]
    
    %% Data Flow
    DataProcessing -->|Cleaned Data| ChartEngine
    ChartEngine -->|JSON/Chart Config| Backend
    
    %% Response
    Backend -->|Returns Dashboard Data| UI
    UI -->|Renders Interactive Dashboard| User
```

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Pandas
- **Containerization:** Docker

## Features

- **Automated Dashboards:** Upload your data and instantly get a tailored dashboard.
- **Global Slicers:** Filter your data across all charts simultaneously.
- **Interactive Data Explorer:** Dive deep into specific metrics and trends.
