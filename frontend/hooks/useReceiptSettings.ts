import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ReceiptSettings, withReceiptDefaults } from '@/lib/receiptSettings';

const RECEIPT_SETTINGS_KEY = ['receiptSettings'];

export function useReceiptSettings() {
  return useQuery({
    queryKey: RECEIPT_SETTINGS_KEY,
    queryFn: async () => {
      const response = await api.get<Partial<ReceiptSettings>>('/api/settings/receipt');
      return withReceiptDefaults(response.data);
    },
  });
}

export function useUpdateReceiptSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReceiptSettings) => {
      const response = await api.put<Partial<ReceiptSettings>>('/api/settings/receipt', data);
      return withReceiptDefaults(response.data);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(RECEIPT_SETTINGS_KEY, saved);
    },
  });
}
