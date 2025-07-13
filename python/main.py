from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from python.services.process_csv_feedbacks import process_csv_feedbacks
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


@app.post("/feedback/csv_upload")
async def upload_feedback_csv(
    file: UploadFile = File(...),
    feedback_column: str = Form("feedback_text")
):
    try:
        file_content = await file.read()
        csv_text = file_content.decode("utf-8")
        return await process_csv_feedbacks(csv_text, feedback_column)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
