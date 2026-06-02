import { useState, useEffect } from 'react';
import { getBCVRates } from '../services/bcvService';
import { safeGetItem, safeSetItem } from '../utils/storage';

const STORAGE_KEY = '@bolosya_bcv_rate';

export interface BCVRateData {
  createdAt: string;
  usdRate: number;
  eurRate: number;
}

interface StoreEntry {
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
    let rateData: BCVRateData | null = null;

    try {
      const cached = await safeGetItem(STORAGE_KEY);
      if (cached) {
        const parsed: StoreEntry = JSON.parse(cached);
        if (parsed.lastFetched?.startsWith(new Date().toISOString().split('T')[0])) {
          rateData = { createdAt: parsed.lastFetched, usdRate: parsed.usdRate, eurRate: parsed.eurRate };
          setRate(rateData);
          setIsLoading(false);
          return;
        }
        rateData = { createdAt: parsed.lastFetched, usdRate: parsed.usdRate, eurRate: parsed.eurRate };
        setRate(rateData);
      }
    } catch {
      // ignore parse errors, fetch fresh
    }

    try {
      const response = await getBCVRates();
      if (response.success) {
        const data: StoreEntry = {
          usdRate: response.data.usdRate / 100,
          eurRate: response.data.eurRate / 100,
          lastFetched: new Date().toISOString(),
        };
        await safeSetItem(STORAGE_KEY, JSON.stringify(data));
        rateData = { createdAt: response.data.createdAt, usdRate: data.usdRate, eurRate: data.eurRate };
        setRate(rateData);
      }
    } catch (err) {
      if (!rateData) {
        setError(err instanceof Error ? err : new Error('Failed to load BCV rate'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { rate, isLoading, error };
}
