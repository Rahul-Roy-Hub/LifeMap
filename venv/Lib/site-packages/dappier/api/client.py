from contextlib import AbstractContextManager
import httpx
import logging
from dappier.types import BASE_URL

class DappierClient(AbstractContextManager):
    def __init__(self, api_key: str) -> None:
        """
        Initialize the API client.

        :param api_key: The API key used to interact with the Dappier APIs.
        """
        self.api_key = api_key
        self._base_url = BASE_URL
        self._headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.Client(base_url=self._base_url, headers=self._headers, timeout=60.0)

    def close(self):
        """
        Explicitly close the Client to release resources.
        """
        if not self.client.is_closed:
            self.client.close()

    def __enter__(self):
        """
        Support context management to automatically open the client.
        """
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """
        Support context management to automatically close the client.
        """
        self.close()

    def __del__(self):
        """
        Ensure the client is closed if it is not closed explicitly.
        """
        if self.client and not self.client.is_closed:
            logging.warning(
                "DappierSyncClient instance was not closed properly. "
                "Use `with` or explicitly call `close()` to manage resources."
            )
            self.client.close()