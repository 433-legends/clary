import asyncio

from agents import Runner
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from python.ai.agents.ticketing_agent import filter_feedback_agent

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
            result = asyncio.run(Runner.run(filter_feedback_agent, text))
            print("Message {}: User: {}, Text: {}, Filter Result: {}".format(i, user, text, result))
        return messages
    except SlackApiError as e:
        print(f"Error fetching messages: {e.response['error']}")
        return []
