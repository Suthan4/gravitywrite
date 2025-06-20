export interface Medication {
  id: string;
  user_id: string;
  medication_name: string;
  dosage?: string;
  frequency: string;
  time_to_take?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  user_id: string;
  taken_at: string;
  date_taken: string;
  photo_url?: string;
  created_at: string;
}

export interface MedicationWithLogs extends Medication {
  logs: MedicationLog[];
}

export interface CreateMedicationData {
  name: string;
  dosage?: string;
  frequency: string;
  time_to_take?: string;
}

export interface CreateMedicationLogData {
  medication_id: string;
  date_taken: string;
  photo_url?: string;
}

export interface AdherenceStats {
  totalMedications: number;
  takenToday: number;
  adherencePercentage: number;
  currentStreak: number;
  missedThisMonth: number;
}