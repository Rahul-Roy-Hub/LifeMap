import { useState } from 'react';

const API_URL = 'http://localhost:5000/api/process-input';

export const useLifeMapAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processInput = async (input: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process input');
      }

      setIsLoading(false);
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
      throw err;
    }
  };

  return {
    processInput,
    isLoading,
    error,
  };
}; 