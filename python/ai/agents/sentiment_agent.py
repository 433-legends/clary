import os
from typing import TypeVar

from agents import Agent, set_default_openai_key, ModelSettings
from python.prompts.sentiment_analysis import SENTIMENT_ANALYSIS_PROMPT

TContext = TypeVar('TContext')

model_settings = ModelSettings(temperature=0.0)

set_default_openai_key(os.getenv("OPENAI_API_KEY"))  # Set your OpenAI API key here

sentiment_agent = Agent[TContext](
    model="gpt-4o",
    name="SentimentAgent",
    instructions=SENTIMENT_ANALYSIS_PROMPT,
    model_settings=model_settings,
)