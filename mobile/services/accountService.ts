import { apiDelete } from './api';

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

export async function deleteAccount(): Promise<void> {
  const res = await apiDelete<DeleteAccountResponse>('/auth/me');
  if (!res.success) {
    throw new Error(res.message || 'No se pudo eliminar la cuenta');
  }
}
