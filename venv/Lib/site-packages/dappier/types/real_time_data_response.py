from pydantic import BaseModel, Field

class RealTimeDataResponse(BaseModel):
    message: str = Field(..., description="Response message or status from the AI model.")
