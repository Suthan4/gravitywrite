import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import PatientDashboard from "@/components/PatientDashboard";
import CaretakerDashboard from "@/components/CaretakerDashboard";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  UserCircle,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContextProvider";
import { useClickOutside } from "@/hooks/useClickOutside";

type UserType = "patient" | "caretaker" | null;

const Index = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCaretakerDlgOpen, setIsCaretakerDlgOpen] = useState(false);
  const [isPatientDlgOpen, setIsPatientDlgOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const ref = useClickOutside<HTMLDivElement>(() => {
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  });

  // Initialize user type from user metadata
  useEffect(() => {
    if (user?.userType) {
      setUserType(user.userType);
      setIsOnboarded(true);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
      setShowUserMenu(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error?.message
          : "Something went wrong. Please try again.";
      toast({
        title: "Unexpected Error",
        description: message,
      });
    }
  };

  const handleOnboardingComplete = (type: UserType) => {
    setUserType(type);
    setIsOnboarded(true);
  };

  const switchUserType = () => {
    const newType = userType === "patient" ? "caretaker" : "patient";
    setUserType(newType);
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/20 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                MediCare Companion
              </h1>
              <p className="text-sm text-muted-foreground">
                {userType === "patient" ? "Patient View" : "Caretaker View"}
              </p>
            </div>
          </div>
          {/* User Menu Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={ref}>
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-accent transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                {user?.fullName || user?.email}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border/20 py-1 z-50">
                  <hr className="my-1 border-border/20" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={switchUserType}
              className="flex items-center gap-2 hover:bg-accent transition-colors"
            >
              {userType === "patient" ? (
                <Users className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              Switch to {userType === "patient" ? "Caretaker" : "Patient"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {userType === "patient" ? (
          <PatientDashboard
            setIsPatientDlgOpen={setIsPatientDlgOpen}
            isPatientDlgOpen={isPatientDlgOpen}
          />
        ) : (
          <CaretakerDashboard
            setIsCaretakerDlgOpen={setIsCaretakerDlgOpen}
            isCaretakerDlgOpen={isCaretakerDlgOpen}
          />
        )}
      </main>
    </div>
  );
};

export default Index;