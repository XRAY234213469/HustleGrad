// frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react';

/**
 * Generic hook that wraps any async API function.
 *
 * Usage:
 *   const { execute, data, loading, error } = useApi(listingsApi.search);
 *   useEffect(() => { execute({ category_id: 1 }); }, []);
 */
const useApi = (apiFn) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
};

export default useApi;
