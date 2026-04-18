import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { RevenueReport, OrderStats, WaiterPerformance, TopProduct } from '@/types';

export function useRevenueReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'revenue', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<RevenueReport>('/api/reports/revenue', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useOrderStats(date: string) {
  return useQuery({
    queryKey: ['reports', 'orders', date],
    queryFn: async () => {
      const response = await api.get<OrderStats>('/api/reports/orders', {
        params: { date },
      });
      return response.data;
    },
    enabled: !!date,
  });
}

export function useWaiterPerformance(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'waiters', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<WaiterPerformance[]>('/api/reports/waiters', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useTopProducts(startDate: string, endDate: string, limit: number = 10) {
  return useQuery({
    queryKey: ['reports', 'top-products', startDate, endDate, limit],
    queryFn: async () => {
      const response = await api.get<TopProduct[]>('/api/reports/top-products', {
        params: { start_date: startDate, end_date: endDate, limit },
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
}
