import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useMoneyData(month, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!enabled) { setData(null); setLoading(false); return; }
    setLoading(true); setError('');
    try { setData(await api.month(month)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [month, enabled]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
