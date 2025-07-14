import os
from typing import TypeVar

from agents import (
    Agent, set_default_openai_key, ModelSettings
)
from python.prompts.fiter_customer_feedback import FILTER_CUSTOMER_FEEDBACK
TContext = TypeVar('TContext')

model_settings = ModelSettings(temperature=0.0)


set_default_openai_key(os.getenv("OPENAI_API_KEY"))  # Set your OpenAI API key here

filter_feedback_agent = Agent[TContext](
    model="gpt-4.1",
    name="Vibora",
    instructions=FILTER_CUSTOMER_FEEDBACK,
    model_settings=model_settings,
)
