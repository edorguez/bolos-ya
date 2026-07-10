import { useState, useEffect, useCallback, useRef } from 'react';
import { getBCVRates } from '../services/bcvService';
import { safeGetItem, safeSetItem } from '../utils/storage';

const STORAGE_KEY = '@bolosya_bcv_rate';

function localDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface BCVRateData {
  createdAt: string;
  usdRate: number;
  eurRate: number;
}

interface StoreEntry {
  usdRate: number;
  eurRate: number;
  createdAt: string;
  lastFetched: string;
}

export interface BCVRateRef {
  refresh: () => Promise<void>;
}

export function useBCV() {
  const [rate, setRate] = useState<BCVRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  const loadRate = useCallback(async (force = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    let rateData: BCVRateData | null = null;
    let cached: string | null = null;
    const today = localDateStr();

    try {
      cached = await safeGetItem(STORAGE_KEY);
      if (cached) {
        const parsed: StoreEntry = JSON.parse(cached);
        if (!force && parsed.lastFetched === today) {
          rateData = {
            createdAt: parsed.createdAt,
            usdRate: parsed.usdRate,
            eurRate: parsed.eurRate,
          };
          setRate(rateData);
          setIsLoading(false);
          fetchingRef.current = false;
          return;
        }
        rateData = {
          createdAt: parsed.createdAt,
          usdRate: parsed.usdRate,
          eurRate: parsed.eurRate,
        };
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
          createdAt: response.data.createdAt,
          lastFetched: today,
        };
        await safeSetItem(STORAGE_KEY, JSON.stringify(data));
        rateData = {
          createdAt: response.data.createdAt,
          usdRate: data.usdRate,
          eurRate: data.eurRate,
        };
        setRate(rateData);
        setError(null);
      }
    } catch (err) {
      if (!rateData) {
        if (cached) {
          try {
            const parsed: StoreEntry = JSON.parse(cached);
            setRate({
              createdAt: parsed.createdAt,
              usdRate: parsed.usdRate,
              eurRate: parsed.eurRate,
            });
          } catch {
            setError(err instanceof Error ? err : new Error('Failed to load BCV rate'));
          }
        } else {
          setError(err instanceof Error ? err : new Error('Failed to load BCV rate'));
        }
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadRate();
  }, [loadRate]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadRate(true);
  }, [loadRate]);

  return { rate, isLoading, error, refresh, loadRate };
}
