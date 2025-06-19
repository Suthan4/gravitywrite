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
import { Mail, Plus } from "lucide-react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  CaretakerFormData,
  caretakerFormSchema,
  FREQUENCY_OPTIONS,
} from "../types/careTaker";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMedicationService } from "../services/medicationService";

interface FormDlgProps {
  isCaretakerDlgOpen: boolean;
  handleOpenCaretakerDialog: (open: boolean) => void;
}
const FormDlg = ({
  isCaretakerDlgOpen,
  handleOpenCaretakerDialog,
}: FormDlgProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMedicationMutation } = useMedicationService();

  // React Hook Form setup
  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    reset,
  } = useForm<CaretakerFormData>({
    resolver: zodResolver(caretakerFormSchema),
    defaultValues: {
      medication_name: "",
      frequency: "Daily", // Default frequency
      time_to_take: "",
    },
  });

  //Form Submission handler
  const onSubmit: SubmitHandler<CaretakerFormData> = async (data) => {
    try {
      setIsLoading(true);
      await addMedicationMutation.mutateAsync(data);
      console.log("Form submitted with data:", data);
      reset();
      handleOpenCaretakerDialog(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Form errors:", errors);

  return (
    <>
      {/* Form Dialog */}
      <Dialog
        open={isCaretakerDlgOpen}
        onOpenChange={handleOpenCaretakerDialog}
      >
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white p-2 rounded-lg">
                  <Plus className="h-5 w-5" />
                </div>
                Add Medication
              </DialogTitle>
              <DialogDescription>
                Manage your daily medication schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Medication Name */}
              <div className="space-y-2">
                <Label htmlFor="medication_name">Medication Name</Label>
                <Input
                  id="medication_name"
                  autoFocus={true}
                  placeholder="Enter Medication name"
                  disabled={addMedicationMutation.isPending}
                  {...register("medication_name")}
                  error={errors.medication_name}
                  errorMsg={errors.medication_name?.message}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={addMedicationMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
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
                <Label htmlFor="time_to_take">Time to Take</Label>
                <Input
                  id="time_to_take"
                  type="time"
                  disabled={addMedicationMutation.isPending}
                  className="pl-10"
                  {...register("time_to_take")}
                  error={errors.time_to_take}
                  errorMsg={errors.time_to_take?.message}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={addMedicationMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg"
              >
                {addMedicationMutation.isPending
                  ? "Adding..."
                  : "Add Medication"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormDlg;
