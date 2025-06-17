import { supabase } from "@/lib/supabaseClient";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface IUser {
  id: string;
  email: string;
  fullName: string;
  userType: "patient" | "caretaker";
}

interface IAuthContextType {
  user: IUser | null;
}

// Create Context
const AuthContext = createContext<IAuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (session?.user) {
        const userData = {
          id: session?.user.id,
          email: session?.user.email,
          fullName: session?.user.user_metadata?.fullName,
          userType: session?.user.user_metadata?.userType,
        };
        setUser(userData);

        // Store in sessionStorage for persistence
        sessionStorage.setItem("access_token", session.access_token);
        sessionStorage.setItem("refresh_token", session.refresh_token);
      } else {
        setUser(null);
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.fullName || "",
          userType: session.user.user_metadata?.userType || "patient",
          avatar_url: session.user.user_metadata?.avatar_url,
        };
        setUser(userData);

        // Store tokens
        sessionStorage.setItem("access_token", session.access_token);
        sessionStorage.setItem("refresh_token", session.refresh_token);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  };
  const value: IAuthContextType = {
    user,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
