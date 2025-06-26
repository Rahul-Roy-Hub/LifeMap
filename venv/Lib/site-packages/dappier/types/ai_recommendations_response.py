from pydantic import BaseModel, Field
from typing import List, Optional

class Result(BaseModel):
    author: Optional[str] = Field(None, description="Author of the article")
    image_url: Optional[str] = Field(None, description="URL of the article image")
    preview_content: Optional[str] = Field(None, description="Preview of the article content")
    pubdate: Optional[str] = Field(None, description="Publication date of the article")
    pubdate_unix: Optional[int] = Field(None, description="Publication date in Unix timestamp")
    score: Optional[float] = Field(None, description="Relevance score of the result (optional)")
    site: Optional[str] = Field(None, description="Name of the website hosting the article")
    site_domain: Optional[str] = Field(None, description="Domain name of the website")
    source_url: str = Field(..., description="URL to the original source")
    summary: str = Field(..., description="Summary of the article")
    title: str = Field(..., description="Title of the article")
    url: Optional[str] = Field(None, description="URL of the article click tracking link")

class Response(BaseModel):
    query: Optional[str] = Field(None, description="Query used to search for recommendations")
    results: Optional[List[Result]] = Field(None, description="List of recommendation results")
    message: Optional[str] = Field(None, description="Any message related to the response (empty if none)")

class AIRecommendationsResponse(BaseModel):
    status: Optional[str] = Field(None, description="Status of the API response (e.g., 'success')")
    response: Optional[Response] = Field(None, description="The response content with query and results")
