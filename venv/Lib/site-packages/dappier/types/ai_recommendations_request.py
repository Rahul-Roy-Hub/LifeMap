from typing import Optional, Literal
from pydantic import BaseModel, Field

SearchAlgorithm = Literal['most_recent', 'semantic', 'most_recent_semantic', 'trending']

class AIRecommendationsRequest(BaseModel):
    datamodel_id: str = Field(..., description="Data model ID, starting with dm_.")
    query: str = Field(..., description="Natural language query, keyword, or URL. If URL is specified, the AI analyzes the page context, summarizes, and provides semantic recommendations.")
    similarity_top_k: int = Field(9, description="Number of articles to return.", gt=0)
    ref: Optional[str] = Field(None, description="Site domain where AI recommendations are displayed. Example format: dappier.com.")
    num_articles_ref: int = Field(0, description="Minimum number of articles from the ref domain specified. The rest will come from other sites within the RAG model.", ge=0)
    search_algorithm: SearchAlgorithm = Field('most_recent', description="Search algorithm for retrieving articles.")
