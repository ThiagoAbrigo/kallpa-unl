export interface Session {
  id: string | number;
  external_id?: string;
  schedule_id?: string;
  name: string;
  program_name?: string;
  start_time: string;
  end_time: string;
  day_of_week?: string;
  location?: string;
  attendance_count: number;
  participant_count?: number;
}

export interface Schedule {
  id: string | number;
  external_id?: string;
  name: string;
  program_name?: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  location?: string;
}

export interface Participant {
  id: string;
  external_id?: string;
  name: string;
  dni?: string;
  email?: string;
  phone?: string;
  role?: string;
  status: string;
}

export interface AttendanceRecord {
  id?: string;
  participant_id: string;
  participant_name?: string;
  schedule_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED';
}

export interface AttendanceHistory {
  schedule_id: string;
  schedule_name: string;
  date: string;
  day_of_week?: string;
  start_time: string;
  end_time: string;
  presentes: number;
  ausentes: number;
  total: number;
}

// Alias para compatibilidad
export type HistoryRecord = AttendanceHistory;

export interface SessionDetail {
  date: string;
  schedule?: Schedule;
  stats?: {
    presentes: number;
    ausentes: number;
    total: number;
  };
  records?: AttendanceRecord[];
}

export interface CreateScheduleData {
  name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  program_name?: string;
  location?: string;
}
