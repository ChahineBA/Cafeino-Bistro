import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Service } from '@/types';

export function useServices(date?: string) {
  return useQuery({
    queryKey: ['services', date],
    queryFn: async () => {
      const params = date ? { date_filter: date } : {};
      const response = await api.get<Service[]>('/api/services', { params });
      return response.data;
    },
  });
}

export function useActiveService() {
  return useQuery({
    queryKey: ['services', 'active'],
    queryFn: async () => {
      const response = await api.get<Service | null>('/api/services/active');
      return response.data;
    },
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<Service>('/api/services/clock-in');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<Service>('/api/services/clock-out');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}
