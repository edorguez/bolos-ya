import { apiGet } from './api';
import type { BCVRateResponse } from '../types';

export async function getBCVRates(): Promise<{ success: boolean; data: BCVRateResponse }> {
  return apiGet<{ success: boolean; data: BCVRateResponse }>('/bcv-rates');
}
