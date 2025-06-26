from contextlib import AbstractAsyncContextManager
import httpx
import logging
import asyncio
from dappier.types import BASE_URL


class DappierAsyncClient(AbstractAsyncContextManager):
  def __init__(self, api_key) -> None:
    """
    Initialize the API clinet.

    :param api_key: The api key used to interact with the Dappier apis.
    """
    self.api_key = api_key

    self._baseUrl = BASE_URL
    self._headers = {
      "Authorization": f"Bearer {api_key}",
      "Content-Type": "application/json"
    }
    self.client = httpx.AsyncClient(base_url=self._baseUrl, headers=self._headers, timeout=60.0)
  
  async def close(self):
    """
    Explicitly close the AsyncClinet to release resources.
    """
    if not self.client.is_closed:
      await self.client.aclose()
  
  async def __aenter__(self):
    """
    Suppport async context management to automatically open the client.
    """
    return self
  
  async def __aexit__(self, exc_type, exc_value, traceback):
    """
    Support async context management to automatically close the client.
    """
    await self.close()

  def __del__(self):
    """
    Log a warning if the instance is not closed explicitly.
    """
    if self.client and not self.client.is_closed:
      try:
          asyncio.run(self.close())
      except Exception as e:
          "DappierAsyncClient instance was not closed explicitly. Resources may not be cleaned up."
          logging.error(f"Error while closing DappierAsyncClient: {e}")
