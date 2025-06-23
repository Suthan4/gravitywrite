import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMedicationService } from "@/services/medicationService";
import { useAuth } from "@/context/authContextProvider";
import { supabase } from "@/lib/supabaseClient";

type Frequency =
  | "Daily"
  | "Twice Daily"
  | "Three Times Daily"
  | "Weekly"
  | "As Needed";

const frequency: Frequency = "Daily";

// Mock dependencies
vi.mock("@/context/authContextProvider");
vi.mock("@/lib/supabaseClient");
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  fullName: "Test User",
  userType: "patient" as const,
};

const mockMedications = [
  {
    id: "1",
    user_id: "test-user-id",
    name: "Aspirin",
    dosage: "100mg",
    frequency: "Daily",
    time_to_take: "08:00",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockMedicationLogs = [
  {
    id: "1",
    medication_id: "1",
    user_id: "test-user-id",
    taken_at: "2024-01-01T08:00:00Z",
    date_taken: "2024-01-01",
    created_at: "2024-01-01T08:00:00Z",
  },
];

describe("useMedicationService", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Mock useAuth
    vi.mocked(useAuth).mockReturnValue({ user: mockUser });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches medications successfully", async () => {
    // Mock both medications and logs queries to prevent undefined errors
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    await waitFor(() => {
      expect(result.current.medicationsLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.medications).toEqual(mockMedications);
    });

    // Verify the query was called correctly
    expect(supabase.from).toHaveBeenCalledWith("MedicationCrud");
  });

  it("fetches medication logs successfully", async () => {
    // Mock both medications and logs queries
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    await waitFor(() => {
      expect(result.current.logsLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.medicationLogs).toEqual(mockMedicationLogs);
    });
  });

  it("calculates adherence stats correctly", async () => {
    // Mock both queries to return data
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    await waitFor(() => {
      expect(result.current.adherenceStats).toEqual({
        totalMedications: expect.any(Number),
        takenToday: expect.any(Number),
        adherencePercentage: expect.any(Number),
        currentStreak: expect.any(Number),
        missedThisMonth: expect.any(Number),
      });
    });

    // Verify specific values
    await waitFor(() => {
      expect(result.current.adherenceStats.totalMedications).toBe(1);
    });
  });

  it("handles add medication mutation", async () => {
    // Mock both queries first to prevent undefined errors
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockMedications[0],
            error: null,
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    const newMedication = {
      name: "New Medication",
      dosage: "50mg",
      frequency: frequency,
      time_to_take: "09:00",
    };

    // Wait for the hook to be ready
    await waitFor(() => {
      expect(result.current.addMedicationMutation).toBeDefined();
    });

    // Trigger the mutation
    result.current.addMedicationMutation.mutate(newMedication);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("MedicationCrud");
    });
  });

  it("handles update medication mutation", async () => {
    // Mock both queries first
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { ...mockMedications[0], name: "Updated Medication" },
            error: null,
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    const updateData = {
      id: "1",
      name: "Updated Medication",
    };

    await waitFor(() => {
      expect(result.current.updateMedicationMutation).toBeDefined();
    });

    result.current.updateMedicationMutation.mutate(updateData);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("MedicationCrud");
    });
  });

  it("handles delete medication mutation", async () => {
    // Mock both queries first
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
          delete: vi.fn().mockReturnThis(),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
          delete: vi.fn().mockReturnThis(),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    await waitFor(() => {
      expect(result.current.deleteMedicationMutation).toBeDefined();
    });

    result.current.deleteMedicationMutation.mutate("1");

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("medication_logs");
      expect(supabase.from).toHaveBeenCalledWith("MedicationCrud");
    });
  });

  it("handles mark medication taken mutation with optimistic updates", async () => {
    // Mock both queries first
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedications,
            error: null,
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMedicationLogs,
            error: null,
          }),
          upsert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockMedicationLogs[0],
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    const logData = {
      medication_id: "1",
      date_taken: "2024-01-01",
    };

    await waitFor(() => {
      expect(result.current.markMedicationTakenMutation).toBeDefined();
    });

    result.current.markMedicationTakenMutation.mutate(logData);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("medication_logs");
    });
  });

  it("handles authentication error", async () => {
    // Mock useAuth to return no user
    vi.mocked(useAuth).mockReturnValue({ user: null });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    // Should not make any queries when user is not authenticated
    await waitFor(() => {
      expect(result.current.medications).toEqual([]);
      expect(result.current.medicationLogs).toEqual([]);
    });
  });

  it("handles query errors gracefully", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "MedicationCrud") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error("Database error"),
          }),
        } as any;
      } else if (table === "medication_logs") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useMedicationService(), { wrapper });

    await waitFor(() => {
      expect(result.current.medicationsError).toBeTruthy();
    });
  });
});