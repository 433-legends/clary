from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from python.services.process_csv_feedbacks import process_csv_feedbacks, process_csv_feedbacks_with_categories
from services.slack_connector import fetch_messages

app = FastAPI(title="Clairites FastAPI App", version="1.0.0")

# CORS Middleware
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/slack/messages/{channel_id}")
def get_slack_messages(channel_id: str, token: str):
    try:
        return fetch_messages(channel_id, token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=e.response["error"])

@app.post("/feedback/columns")
async def get_feedback_columns(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        csv_text = file_content.decode("utf-8")
        lines = csv_text.splitlines()
        if not lines:
            raise HTTPException(status_code=400, detail="CSV file is empty")

        header = lines[0].split(",")
        return {"columns": header}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/feedback/csv_upload")
async def upload_feedback_csv(
        file: UploadFile = File(...),
        feedback_column: str = Query(..., description="Name of the column containing feedback text"),
        filter_feedback: bool = Query(False, description="Whether to filter feedbacks or not")
):
    try:
        file_content = await file.read()
        csv_text = file_content.decode("utf-8")
        return await process_csv_feedbacks(csv_text, feedback_column, filter_feedback)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/feedback/categories/csv_upload")
async def upload_feedback_categories_csv(
        file: UploadFile = File(...),
        feedback_column: str = Query(..., description="Name of the column containing feedback text")
):
    try:
        file_content = await file.read()
        csv_text = file_content.decode("utf-8")
        return await process_csv_feedbacks_with_categories(csv_text, feedback_column)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
