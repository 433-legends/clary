from fastapi import FastAPI, HTTPException
from services.slack_connector import fetch_messages
app = FastAPI(title="Clairites FastAPI App", version="1.0.0")


@app.get("/slack/messages/{channel_id}")
def get_slack_messages(channel_id: str, token: str):
    try:
        return fetch_messages(channel_id, token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=e.response["error"])