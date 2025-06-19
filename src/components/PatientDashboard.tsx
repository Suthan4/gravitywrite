import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { User, Plus, Pill } from "lucide-react";
import { format, isToday } from "date-fns";
import MedicationForm from "./MedicationForm";
import MedicationList from "./MedicationList";
import AdherenceStats from "./AdherenceStats";
import { useMedicationService } from "@/services/medicationService";
import { CreateMedicationData } from "@/types/medication";

interface PatientDashboardProps {
  setIsPatientDlgOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPatientDlgOpen: boolean;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({
  setIsPatientDlgOpen,
  isPatientDlgOpen,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const {
    medications,
    medicationLogs,
    medicationsLoading,
    logsLoading,
    adherenceStats,
    addMedicationMutation,
    deleteMedicationMutation,
    markMedicationTakenMutation,
  } = useMedicationService();

  const handleAddMedication = async (data: CreateMedicationData) => {
    await addMedicationMutation.mutateAsync(data);
  };

  const handleMarkTaken = (medicationId: string, dateTaken: string) => {
    markMedicationTakenMutation.mutate({
      medication_id: medicationId,
      date_taken: dateTaken,
    });
  };

  const handleDeleteMedication = (medicationId: string) => {
    deleteMedicationMutation.mutate(medicationId);
  };

  const isLoading = medicationsLoading || logsLoading;

  // Get dates when medications were taken for calendar highlighting
  const takenDates = new Set(medicationLogs.map(log => log.date_taken));

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{getTimeGreeting()}!</h2>
            <p className="text-white/90 text-lg">
              Ready to stay on track with your medication?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{adherenceStats.currentStreak}</div>
            <div className="text-white/80">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {adherenceStats.takenToday}/{adherenceStats.totalMedications}
            </div>
            <div className="text-white/80">Today's Progress</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{adherenceStats.adherencePercentage}%</div>
            <div className="text-white/80">Monthly Rate</div>
          </div>
        </div>
      </div>

      {/* Adherence Stats */}
      <AdherenceStats stats={adherenceStats} isLoading={isLoading} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Medications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Pill className="w-6 h-6 text-blue-600" />
                  My Medications
                </CardTitle>
                <Button
                  onClick={() => setIsPatientDlgOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <MedicationList
                  medications={medications}
                  medicationLogs={medicationLogs}
                  onMarkTaken={handleMarkTaken}
                  onDelete={handleDeleteMedication}
                  isLoading={markMedicationTakenMutation.isPending || deleteMedicationMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiersClassNames={{
                  selected: "bg-blue-600 text-white hover:bg-blue-700",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isTaken = takenDates.has(dateStr);
                    const isCurrentDay = isToday(date);

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {isTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    );
                  },
                }}
              />

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Medication taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Medication Form Dialog */}
      <MedicationForm
        isOpen={isPatientDlgOpen}
        onClose={() => setIsPatientDlgOpen(false)}
        onSubmit={handleAddMedication}
        isLoading={addMedicationMutation.isPending}
      />
    </div>
  );
};

export default PatientDashboard;