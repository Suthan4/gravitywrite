import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pill, Clock, Trash2, Check, Calendar } from "lucide-react";
import { Medication, MedicationLog } from "@/types/medication";
import { format } from "date-fns";

interface MedicationListProps {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  onMarkTaken: (medicationId: string, dateTaken: string) => void;
  onDelete: (medicationId: string) => void;
  isLoading?: boolean;
}

const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  medicationLogs,
  onMarkTaken,
  onDelete,
  isLoading = false,
}) => {
  const today = new Date().toISOString().split("T")[0];
  console.log("today:", today);

  const isTakenToday = (medicationId: string): boolean => {
    return medicationLogs.some(
      (log) =>
        log.medication_id === medicationId &&
        log.date_taken.split("T")[0] === today
    );
  };

  const getLastTaken = (medicationId: string): string | null => {
    const logs = medicationLogs
      .filter((log) => log.medication_id === medicationId)
      .sort(
        (a, b) =>
          new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime()
      );

    return logs.length > 0 ? logs[0].date_taken : null;
  };

  if (medications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Pill className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No medications yet</h3>
          <p className="text-muted-foreground text-center">
            Add your first medication to start tracking your daily routine
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {medications.map((medication) => {
        const takenToday = isTakenToday(medication.id);
        const lastTaken = getLastTaken(medication.id);

        return (
          <Card
            key={medication.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      takenToday ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    {takenToday ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <Pill className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {medication.medication_name}
                      </h3>
                      <Badge variant={takenToday ? "secondary" : "outline"}>
                        {medication.frequency}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {medication.dosage && (
                        <span>Dosage: {medication.dosage}</span>
                      )}
                      {medication.time_to_take && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{medication.time_to_take}</span>
                        </div>
                      )}
                    </div>

                    {lastTaken && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Last taken:{" "}
                          {format(new Date(lastTaken), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!takenToday && (
                    <Button
                      onClick={() => onMarkTaken(medication.id, today)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark Taken
                    </Button>
                  )}

                  {takenToday && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      ✓ Taken Today
                    </Badge>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "
                          {medication.medication_name}"? This action cannot be
                          undone and will also remove all associated logs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(medication.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MedicationList;
