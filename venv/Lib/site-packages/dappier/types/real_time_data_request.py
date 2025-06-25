from pydantic import BaseModel, Field

class RealTimeDataRequest(BaseModel):
    query: str = Field(..., description="Natural language query or keyword.")
