import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target, AlertTriangle } from "lucide-react";
import { AdherenceStats as AdherenceStatsType } from "@/types/medication";

interface AdherenceStatsProps {
  stats: AdherenceStatsType;
  isLoading?: boolean;
}

const AdherenceStats: React.FC<AdherenceStatsProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getAdherenceStatus = (percentage: number) => {
    if (percentage >= 90) return { label: "Excellent", variant: "secondary" as const };
    if (percentage >= 70) return { label: "Good", variant: "outline" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  const adherenceStatus = getAdherenceStatus(stats.adherencePercentage);

  return (
    <div className="space-y-6">
      {/* Main Adherence Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Monthly Adherence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getAdherenceColor(stats.adherencePercentage)}`}>
                  {stats.adherencePercentage}%
                </span>
                <Badge variant={adherenceStatus.variant}>
                  {adherenceStatus.label}
                </Badge>
              </div>
            </div>
            <Progress value={stats.adherencePercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium text-green-600">
                  {Math.round((stats.adherencePercentage / 100) * 30)} days
                </div>
                <div className="text-muted-foreground">Taken</div>
              </div>
              <div>
                <div className="font-medium text-red-600">{stats.missedThisMonth}</div>
                <div className="text-muted-foreground">Missed</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">
                  {Math.max(0, 30 - Math.round((stats.adherencePercentage / 100) * 30) - stats.missedThisMonth)}
                </div>
                <div className="text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.takenToday}/{stats.totalMedications}</div>
                <div className="text-muted-foreground">Today's Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.missedThisMonth}</div>
                <div className="text-muted-foreground">Missed This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdherenceStats;