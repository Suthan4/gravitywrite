import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Users,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  LoginFormData,
  loginSchema,
  RegisterFormData,
  registerSchema,
} from "../types/authform";

const Authentication = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    mode: "all",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userType: undefined,
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { data: userData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
        });
        return;
      }
      toast({
        title: "Login Successful",
      });
      console.log("userData", userData);

      loginForm.reset();
      navigate("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast({
        title: "Unexpected Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { data: userData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            fullName: data.fullName,
            userType: data.userType,
          },
        },
      });
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
      registerForm.reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast({
        title: "Unexpected Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setAuthError(null);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MediCare Companion
          </h1>
          <p className="text-muted-foreground">
            {isRegistering
              ? "Create your account to get started"
              : "Welcome back! Please sign in to continue"}
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {isRegistering ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isRegistering
                ? "Join thousands managing their medications safely"
                : "Access your medication management dashboard"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {isRegistering ? (
              /* Register Form */
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        autoFocus={true}
                        placeholder="Enter your full name"
                        className="pl-10"
                        disabled={isLoading}
                        {...registerForm.register("fullName")}
                        error={registerForm.formState.errors.fullName}
                        errorMsg={
                          registerForm.formState.errors.fullName?.message
                        }
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        disabled={isLoading}
                        placeholder="Enter your email"
                        className="pl-10"
                        {...registerForm.register("email")}
                        error={registerForm.formState.errors.email}
                        errorMsg={registerForm.formState.errors.email?.message}
                      />
                    </div>
                  </div>

                  {/* User Type Selection */}
                  <div className="space-y-3">
                    <Label>I am a:</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="radio"
                          id="patient"
                          disabled={isLoading}
                          value="patient"
                          className="sr-only peer"
                          {...registerForm.register("userType")}
                        />
                        <label
                          htmlFor="patient"
                          className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 peer-checked:border-blue-500 peer-checked:bg-blue-50"
                        >
                          <User className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">Patient</span>
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="radio"
                          id="caretaker"
                          disabled={isLoading}
                          value="caretaker"
                          className="sr-only peer"
                          {...registerForm.register("userType")}
                        />
                        <label
                          htmlFor="caretaker"
                          className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 peer-checked:border-green-500 peer-checked:bg-green-50"
                        >
                          <Users className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium">Caretaker</span>
                        </label>
                      </div>
                    </div>
                    {registerForm.formState.errors.userType && (
                      <p className="text-xs text-red-600">
                        {registerForm.formState.errors.userType.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...registerForm.register("password")}
                        error={registerForm.formState.errors.password}
                        errorMsg={
                          registerForm.formState.errors.password?.message
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...registerForm.register("confirmPassword")}
                        error={registerForm.formState.errors.confirmPassword}
                        errorMsg={
                          registerForm.formState.errors.confirmPassword?.message
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        autoFocus
                        placeholder="Enter your email"
                        className="pl-10"
                        {...loginForm.register("email")}
                        error={loginForm.formState.errors.email}
                        errorMsg={loginForm.formState.errors.email?.message}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...loginForm.register("password")}
                        error={loginForm.formState.errors.password}
                        errorMsg={loginForm.formState.errors.password?.message}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </form>
            )}

            {/* Switch Mode */}
            <div className="flex justify-between items-baseline text-center border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  {isRegistering
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>
              </div>
              <div>
                <Button
                  variant="link"
                  onClick={switchMode}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isRegistering ? "Sign In Instead" : "Create New Account"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Authentication;
