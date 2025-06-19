import React from "react";
import MedicationForm from "@/components/MedicationForm";
import { CreateMedicationData } from "@/types/medication";

interface FormDlgProps {
  isCaretakerDlgOpen: boolean;
  handleOpenCaretakerDialog: (open: boolean) => void;
  onSubmit?: (data: CreateMedicationData) => Promise<void>;
  isLoading?: boolean;
}

const FormDlg: React.FC<FormDlgProps> = ({
  isCaretakerDlgOpen,
  handleOpenCaretakerDialog,
  onSubmit,
  isLoading = false,
}) => {
  const handleClose = () => {
    handleOpenCaretakerDialog(false);
  };

  const handleSubmit = async (data: CreateMedicationData) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <MedicationForm
      isOpen={isCaretakerDlgOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};

export default FormDlg;