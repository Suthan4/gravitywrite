import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/authContextProvider";
import { supabase } from "@/lib/supabaseClient";
import { CaretakerFormData } from "../types/careTaker";
import { useToast } from "@/hooks/use-toast";
import { ICareTakeMedicationsResponse } from "../types/caretaker.interface";

export const useMedicationService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add medication
  const addMedicationMutation = useMutation({
    mutationFn: async (medicationData: CaretakerFormData) => {
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
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({
        title: "Success",
        description: "Medication added successfully!",
        variant: "default",
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

  // Fetch medication
  const {
    data: medications = [],
    isLoading: medicationsLoading,
    error: medicationsError,
  } = useQuery({
    queryKey: ["MedicationCrud", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("MedicationCrud")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ICareTakeMedicationsResponse[];
    },
    enabled: !!user?.id,
  });

  // Update medication
  const updateMedicationMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CaretakerFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from("medications")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      return data as ICareTakeMedicationsResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({
        title: "Success",
        description: "Medication updated successfully!",
        variant: "default",
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

  // Delete medication
  const deleteMedicationMutation = useMutation({
    mutationFn: async (medicationId: string) => {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", medicationId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({
        title: "Success",
        description: "Medication deleted successfully!",
        variant: "default",
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

  return {
    addMedicationMutation,
    medications,
    medicationsLoading,
    medicationsError,
    updateMedicationMutation,
    deleteMedicationMutation,
  };
};
