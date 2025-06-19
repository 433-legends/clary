from typing import TypeVar

from agents import (
    Agent,
)
from python.prompts.fiter_ticketing import FILTER_TICKETING
TContext = TypeVar('TContext')

model_settings = {
    "temperature": 0.0,
}

filter_tickets = Agent[TContext](
    model="gpt-4.1",
    name="Ticket filtering Agent",
    instructions=FILTER_TICKETING,
    model_settings=model_settings,
)
