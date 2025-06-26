from dappier.types import AIRecommendationsResponse

def ai_recommendations_to_string(response: AIRecommendationsResponse) -> str:
    """
    Converts a Dappier AI Recommendations API response into a human-readable text format for LLMs.

    Args:
        response (Any): JSON object returned by the Dappier API.

    Returns:
        str: A formatted string representation of the recommendations.
    """
    if response.status != "success":
        return "The API response was not successful."

    results = response.response.results

    formatted_text = ""
    for idx, result in enumerate(results, start=1):
        formatted_text += (
            f"Result {idx}:\n"
            f"Title: {result.title}\n"
            f"Author: {result.author}\n"
            f"Published on: {result.pubdate}\n"
            f"Source: {result.site} ({result.site_domain})\n"
            f"URL: {result.source_url}\n"
            f"Image URL: {result.image_url}\n"
            f"Summary: {result.summary}\n"
            f"Score: {result.score}\n\n"
        )

    return formatted_text
