import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

interface InputProps extends React.ComponentProps<"input">{
  error?:boolean | FieldError;
  errorMsg?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text",error,errorMsg, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1">
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-md border  bg-white px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1",
            !hasError ? "border-border" : "border-red-600",
            !hasError
              ? "focus:border-gray-100 focus:ring-primary/40"
              : "focus:border-red-600 focus:ring-red-600",
            "disabled:cursor-not-allowed disabled:opacity-50 transition duration-150 ease-in-out",
            className
          )}
          {...props}
        />
        {error && errorMsg && (
          <p className="text-xs text-red-600">{errorMsg}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
