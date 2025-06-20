import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/authContextProvider";
import { toast } from "@/hooks/use-toast";
import {
  Medication,
  MedicationLog,
  CreateMedicationData,
  CreateMedicationLogData,
  AdherenceStats,
} from "@/types/medication";
import React from "react";
import { MedicationFormData } from "@/components/MedicationForm";

export const useMedicationService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch medications
  const {
    data: medications = [],
    isLoading: medicationsLoading,
    error: medicationsError,
  } = useQuery({
    queryKey: ["medications", user?.id],
    queryFn: async (): Promise<Medication[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("MedicationCrud")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch medication logs
  const { data: medicationLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["medication-logs", user?.id],
    queryFn: async (): Promise<MedicationLog[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: async (
      medicationData: MedicationFormData
    ): Promise<Medication> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("MedicationCrud")
        .insert([
          {
            ...medicationData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({
        title: "Success",
        description: "Medication added successfully!",
      });
    },
    onError: (error) => {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update medication mutation
  const updateMedicationMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CreateMedicationData> & { id: string }): Promise<Medication> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("MedicationCrud")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({
        title: "Success",
        description: "Medication updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating medication:", error);
      toast({
        title: "Error",
        description: "Failed to update medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete medication mutation
  const deleteMedicationMutation = useMutation({
    mutationFn: async (medicationId: string): Promise<void> => {
      if (!user?.id) throw new Error("User not authenticated");

      // First delete all logs for this medication
      await supabase
        .from("medication_logs")
        .delete()
        .eq("medication_id", medicationId)
        .eq("user_id", user.id);

      // Then delete the medication
      const { error } = await supabase
        .from("MedicationCrud")
        .delete()
        .eq("id", medicationId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["medication-logs", user?.id],
      });
      toast({
        title: "Success",
        description: "Medication deleted successfully!",
      });
    },
    onError: (error) => {
      console.error("Error deleting medication:", error);
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark medication as taken mutation with optimistic updates
  const markMedicationTakenMutation = useMutation({
    mutationFn: async (
      logData: CreateMedicationLogData
    ): Promise<MedicationLog> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("medication_logs")
        .upsert({
          ...logData,
          user_id: user.id,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newLog) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["medication-logs", user?.id],
      });

      // Snapshot previous value
      const previousLogs = queryClient.getQueryData<MedicationLog[]>([
        "medication-logs",
        user?.id,
      ]);

      // Optimistically update
      if (previousLogs) {
        const optimisticLog: MedicationLog = {
          id: `temp-${Date.now()}`,
          ...newLog,
          user_id: user?.id || "",
          taken_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData<MedicationLog[]>(
          ["medication-logs", user?.id],
          [...previousLogs, optimisticLog]
        );
      }

      return { previousLogs };
    },
    onError: (err, newLog, context) => {
      // Rollback on error
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["medication-logs", user?.id],
          context.previousLogs
        );
      }
      toast({
        title: "Error",
        description: "Failed to mark medication as taken. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["medication-logs", user?.id],
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Medication marked as taken!",
      });
    },
  });

  // Calculate adherence stats
  const adherenceStats: AdherenceStats = React.useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const takenToday = medicationLogs.filter(
      (log) => log.date_taken.split("T")[0] === today
    ).length;

    const totalMedications = medications.length;

    // Calculate adherence percentage for this month
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const expectedDoses = totalMedications * daysInMonth;
    const actualDoses = medicationLogs.filter((log) => {
      const logDate = new Date(log.date_taken.split("T")[0]);
      return (
        logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear
      );
    }).length;

    const adherencePercentage =
      expectedDoses > 0 ? Math.round((actualDoses / expectedDoses) * 100) : 0;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    while (currentStreak < 30) {
      // Max 30 days to prevent infinite loop
      const dateStr = checkDate.toISOString().split("T")[0];
      const takenOnDate = medicationLogs.some(
        (log) => log.date_taken.split("T")[0] === dateStr
      );

      if (!takenOnDate) break;

      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate missed this month
    const missedThisMonth = Math.max(0, expectedDoses - actualDoses);

    return {
      totalMedications,
      takenToday,
      adherencePercentage,
      currentStreak,
      missedThisMonth,
    };
  }, [medications, medicationLogs]);

  return {
    medications,
    medicationLogs,
    medicationsLoading,
    logsLoading,
    medicationsError,
    adherenceStats,
    addMedicationMutation,
    updateMedicationMutation,
    deleteMedicationMutation,
    markMedicationTakenMutation,
  };
};
