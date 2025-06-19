import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

def fetch_messages(channel_id, slack_bot_token, limit=100):
    try:
        client = WebClient(token=slack_bot_token)
        response = client.conversations_history(
            channel=channel_id,
            limit=limit
        )
        messages = response['messages']
        for i, msg in enumerate(messages, 1):
            user = msg.get('user', 'bot')
            text = msg.get('text', '')
            print(f"{i}. [{user}] {text}")
        return messages
    except SlackApiError as e:
        print(f"Error fetching messages: {e.response['error']}")
        return []
