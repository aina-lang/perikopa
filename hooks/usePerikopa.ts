import { useState, useEffect, useCallback } from 'react';
import { PerikopaData } from '../types/perikopa';
import { PerikopaService } from '../services/PerikopaService';

export function usePerikopa() {
  const [data, setData] = useState<PerikopaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadLocal = useCallback(async () => {
    setLoading(true);
    const loaded = await PerikopaService.loadData();
    setData(loaded);
    setLoading(false);
  }, []);

  const refreshFromRemote = useCallback(async () => {
    setUpdating(true);
    const success = await PerikopaService.updateData();
    if (success) {
      const updated = await PerikopaService.loadData();
      setData(updated);
    }
    setUpdating(false);
    return success;
  }, []);

  useEffect(() => {
    loadLocal();
  }, [loadLocal]);

  return {
    perikopa: data,
    loading,
    updating,
    refreshFromRemote
  };
}
