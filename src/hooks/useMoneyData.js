import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useMoneyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { await api.bootstrap(); setData(await api.month()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
