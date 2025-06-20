import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Users,
  Bell,
  Calendar as CalendarIcon,
  Mail,
  AlertTriangle,
  Check,
  Clock,
  Plus,
} from "lucide-react";
import NotificationSettings from "./NotificationSettings";
import MedicationForm, { MedicationFormData } from "./MedicationForm";
import MedicationList from "./MedicationList";
import AdherenceStats from "./AdherenceStats";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { useMedicationService } from "@/services/medicationService";

interface CaretakerDashboardProps {
  setIsCaretakerDlgOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCaretakerDlgOpen: boolean;
}

const CaretakerDashboard: React.FC<CaretakerDashboardProps> = ({
  setIsCaretakerDlgOpen,
  isCaretakerDlgOpen,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
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

  const handleAddMedication = async (data: MedicationFormData) => {
    await addMedicationMutation.mutate(data);
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

  // Mock patient name - in real app this would come from patient relationship
  const patientName = "Eleanor Thompson";

  // Get dates when medications were taken for calendar highlighting
  const takenDates = new Set(medicationLogs.map((log) => log.date_taken));

  const recentActivity = medicationLogs.slice(0, 5).map((log) => {
    const medication = medications.find((m) => m.id === log.medication_id);
    return {
      date: log.date_taken.split("T")[0],
      medicationName: medication?.medication_name || "Unknown Medication",
      taken: true,
      time: format(new Date(log.taken_at), "h:mm a"),
      hasPhoto: !!log.photo_url,
    };
  });

  const handleSendReminderEmail = () => {
    console.log("Sending reminder email to patient...");
    alert("Reminder email sent to " + patientName);
  };

  const handleConfigureNotifications = () => {
    setActiveTab("notifications");
  };

  const handleViewCalendar = () => {
    setActiveTab("calendar");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Caretaker Dashboard</h2>
            <p className="text-white/90 text-lg">
              Monitoring {patientName}'s medication adherence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {adherenceStats.adherencePercentage}%
            </div>
            <div className="text-white/80">Adherence Rate</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {adherenceStats.currentStreak}
            </div>
            <div className="text-white/80">Current Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {adherenceStats.missedThisMonth}
            </div>
            <div className="text-white/80">Missed This Month</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {adherenceStats.takenToday}
            </div>
            <div className="text-white/80">Taken Today</div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Today's Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Today's Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Total Medications</h4>
                      <p className="text-sm text-muted-foreground">
                        {adherenceStats.totalMedications} medications scheduled
                      </p>
                    </div>
                    <Badge
                      variant={
                        adherenceStats.takenToday ===
                        adherenceStats.totalMedications
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {adherenceStats.takenToday}/
                      {adherenceStats.totalMedications} Taken
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleSendReminderEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder Email
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleConfigureNotifications}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Configure Notifications
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleViewCalendar}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setIsCaretakerDlgOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Adherence Stats */}
          <AdherenceStats stats={adherenceStats} isLoading={isLoading} />

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {activity.medicationName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Taken on{" "}
                            {format(new Date(activity.date), "EEEE, MMMM d")} at{" "}
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.hasPhoto && (
                          <Badge variant="outline">Photo</Badge>
                        )}
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Medications</CardTitle>
                <Button
                  onClick={() => setIsCaretakerDlgOpen(true)}
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
                  isLoading={
                    markMedicationTakenMutation.isPending ||
                    deleteMedicationMutation.isPending
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medication Calendar Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
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
                        const isPast = isBefore(date, startOfDay(new Date()));
                        const isCurrentDay = isToday(date);

                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <span>{date.getDate()}</span>
                            {isTaken && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {!isTaken && isPast && !isCurrentDay && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"></div>
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
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>Missed medication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">
                    Details for {format(selectedDate, "MMMM d, yyyy")}
                  </h4>

                  <div className="space-y-4">
                    {takenDates.has(format(selectedDate, "yyyy-MM-dd")) ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            Medication Taken
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          {patientName} successfully took their medication on
                          this day.
                        </p>
                      </div>
                    ) : isBefore(selectedDate, startOfDay(new Date())) ? (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-800">
                            Medication Missed
                          </span>
                        </div>
                        <p className="text-sm text-red-700">
                          {patientName} did not take their medication on this
                          day.
                        </p>
                      </div>
                    ) : isToday(selectedDate) ? (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            Today
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Monitor {patientName}'s medication status for today.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-800">
                            Future Date
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          This date is in the future.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>

      {/* Medication Form Dialog */}
      <MedicationForm
        isOpen={isCaretakerDlgOpen}
        onClose={() => setIsCaretakerDlgOpen(false)}
        onSubmit={handleAddMedication}
        isLoading={addMedicationMutation.isPending}
      />
    </div>
  );
};

export default CaretakerDashboard;
