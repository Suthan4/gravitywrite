import { time } from "console";
import z from "zod";

export const FREQUENCY_OPTIONS = [
  "Daily",
  "Twice Daily",
  "Three Times Daily",
  "Weekly",
  "As Needed",
] as const;

export const caretakerFormSchema = z.object({
  medication_name: z.string().min(2, "Full name must be at least 2 characters"),
  frequency: z.enum(FREQUENCY_OPTIONS, {
    errorMap: () => ({ message: "Please select a valid frequency" }),
  }),
  time_to_take: z
    .string()
    .min(1, "Please specify a time to take the medication"),
  user_id: z.string().optional(),
});

export type CaretakerFormData = z.infer<typeof caretakerFormSchema>;