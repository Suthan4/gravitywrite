import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("session", session);

      setAuthenticated(!!session);
      if (session) {
        sessionStorage.setItem("access_token", session?.access_token);
        sessionStorage.setItem("refresh_token", session?.refresh_token);
        sessionStorage.setItem("email", session?.user?.user_metadata?.email);
        sessionStorage.setItem(
          "fullName",
          session?.user?.user_metadata?.fullName
        );
        sessionStorage.setItem(
          "userType",
          session?.user?.user_metadata?.userType
        );
      }
      setIsLoading(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error?.message
          : "Something went wrong. Please try again.";
      toast({
        title: "Unexpected Error",
        description: message,
      });
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("fullName");
      sessionStorage.removeItem("userType");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getSession();
  }, []);

  if (isLoading) {
    return <div>Loading....</div>;
  } else {
    if (authenticated) {
      return <Outlet />;
    }
    return <Navigate to="/auth" />;
  }
};

export default ProtectedRoutes;
