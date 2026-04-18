export interface Service {
  _id: string;
  waiter_id: string;
  waiter_name: string;
  clock_in: string;
  clock_out?: string;
  duration_minutes?: number;
  date: string;
  is_active: boolean;
}
