import os
from typing import TypeVar

from agents import Agent, set_default_openai_key, ModelSettings
from python.prompts.cluster_catergories import CLUSTER_CATEGORY_LABELLING_PROMPT

TContext = TypeVar('TContext')

model_settings = ModelSettings(temperature=0.0)

set_default_openai_key(os.getenv("OPENAI_API_KEY"))  # Set your OpenAI API key here

cluster_reviews_agent = Agent[TContext](
    model="gpt-4.1",
    name="ClusterAgent",
    instructions=CLUSTER_CATEGORY_LABELLING_PROMPT,
    model_settings=model_settings,
)