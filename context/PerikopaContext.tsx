import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PerikopaData } from '../types/perikopa';
import { PerikopaService } from '../services/PerikopaService';

interface PerikopaContextType {
  perikopa: PerikopaData | null;
  loading: boolean;
  updating: boolean;
  refreshFromRemote: () => Promise<boolean>;
}

const PerikopaContext = createContext<PerikopaContextType | undefined>(undefined);

export const PerikopaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <PerikopaContext.Provider value={{ perikopa: data, loading, updating, refreshFromRemote }}>
      {children}
    </PerikopaContext.Provider>
  );
};

export const usePerikopa = () => {
  const context = useContext(PerikopaContext);
  if (context === undefined) {
    throw new Error('usePerikopa must be used within a PerikopaProvider');
  }
  return context;
};
