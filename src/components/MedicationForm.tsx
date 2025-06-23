import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pill } from "lucide-react";
import { CreateMedicationData } from "@/types/medication";

const FREQUENCY_OPTIONS = [
  "Daily",
  "Twice Daily",
  "Three Times Daily",
  "Weekly",
  "As Needed",
] as const;

const medicationSchema = z.object({
  medication_name: z
    .string()
    .min(2, "Medication name must be at least 2 characters"),
  dosage: z.string().optional(),
  frequency: z
    .enum(FREQUENCY_OPTIONS, {
      errorMap: () => ({ message: "Please select a valid frequency" }),
    })
    .default("Daily"),
  time_to_take: z.string().min(2, "Time is required"),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  isLoading?: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      medication_name: "",
      dosage: "",
      frequency: "Daily",
      time_to_take: "",
    },
  });

  const handleFormSubmit = async (data: MedicationFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-2 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              Add Medication
            </DialogTitle>
            <DialogDescription>
              Add a new medication to your daily schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Medication Name */}
            <div className="space-y-2">
              <Label htmlFor="medication_name">Medication Name *</Label>
              <div className="relative">
                <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="medication_name"
                  autoFocus
                  placeholder="e.g., Aspirin, Vitamin D"
                  className="pl-10"
                  disabled={isLoading}
                  {...register("medication_name")}
                  error={!!errors.medication_name}
                  errorMsg={errors.medication_name?.message}
                />
              </div>
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage (Optional)</Label>
              <Input
                id="dosage"
                placeholder="e.g., 100mg, 2 tablets"
                disabled={isLoading}
                {...register("dosage")}
                error={!!errors.dosage}
                errorMsg={errors.dosage?.message}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Controller
                name="frequency"
                control={control}
                defaultValue="Daily"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      data-testid="frequency-select-trigger"
                      aria-label="Frequency"
                      role="combobox"
                    >
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    {/* Add portalProps to attach test ID to portal */}
                    <SelectContent  data-testid="frequency-select-content">
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          data-testid={`frequency-option-${option
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.frequency && (
                <p className="text-sm text-red-500">
                  {errors.frequency.message}
                </p>
              )}
            </div>

            {/* Time to Take */}
            <div className="space-y-2">
              <Label htmlFor="time_to_take">Preferred Time (Optional)</Label>
              <Input
                id="time_to_take"
                type="time"
                disabled={isLoading}
                {...register("time_to_take")}
                error={!!errors.time_to_take}
                errorMsg={errors.time_to_take?.message}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isLoading ? "Adding..." : "Add Medication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationForm;
