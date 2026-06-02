import { useState, useEffect } from 'react';
import { getBCVRates } from '../services/bcvService';
import { safeGetItem, safeSetItem } from '../utils/storage';

const STORAGE_KEY = '@bolosya_bcv_rate';

export interface BCVRateData {
  rateDate: string;
  usdRate: number;
  eurRate: number;
}

interface StoreEntry {
  rateDate: string;
  usdRate: number;
  eurRate: number;
  lastFetched: string;
}

export function useBCV() {
  const [rate, setRate] = useState<BCVRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadRate();
  }, []);

  async function loadRate() {
    try {
      const cached = await safeGetItem(STORAGE_KEY);
      if (cached) {
        const parsed: StoreEntry = JSON.parse(cached);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.rateDate === today) {
          setRate({ rateDate: parsed.rateDate, usdRate: parsed.usdRate, eurRate: parsed.eurRate });
          setIsLoading(false);
          return;
        }
        setRate({ rateDate: parsed.rateDate, usdRate: parsed.usdRate, eurRate: parsed.eurRate });
      }
    } catch {
      // ignore parse errors, fetch fresh
    }

    try {
      const response = await getBCVRates();
      if (response.success) {
        const data: StoreEntry = {
          rateDate: response.data.rateDate,
          usdRate: response.data.usdRate / 100,
          eurRate: response.data.eurRate / 100,
          lastFetched: new Date().toISOString(),
        };
        await safeSetItem(STORAGE_KEY, JSON.stringify(data));
        setRate({ rateDate: data.rateDate, usdRate: data.usdRate, eurRate: data.eurRate });
      }
    } catch (err) {
      if (!rate) {
        setError(err instanceof Error ? err : new Error('Failed to load BCV rate'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { rate, isLoading, error };
}
