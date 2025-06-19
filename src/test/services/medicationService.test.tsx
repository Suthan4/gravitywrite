import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMedicationService } from '@/services/medicationService'
import { useAuth } from '@/context/authContextProvider'
import { supabase } from '@/lib/supabaseClient'

// Mock dependencies
vi.mock('@/context/authContextProvider')
vi.mock('@/lib/supabaseClient')
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  fullName: 'Test User',
  userType: 'patient' as const,
}

const mockMedications = [
  {
    id: '1',
    user_id: 'test-user-id',
    name: 'Aspirin',
    dosage: '100mg',
    frequency: 'Daily',
    time_to_take: '08:00',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

const mockMedicationLogs = [
  {
    id: '1',
    medication_id: '1',
    user_id: 'test-user-id',
    taken_at: '2024-01-01T08:00:00Z',
    date_taken: '2024-01-01',
    created_at: '2024-01-01T08:00:00Z',
  },
]

describe('useMedicationService', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    
    // Mock useAuth
    vi.mocked(useAuth).mockReturnValue({ user: mockUser })
    
    // Mock Supabase responses
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as any)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('fetches medications successfully', async () => {
    // Mock successful medications fetch
    const mockSelect = vi.fn().mockResolvedValue({
      data: mockMedications,
      error: null,
    })
    
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    } as any)

    const { result } = renderHook(() => useMedicationService(), { wrapper })

    await waitFor(() => {
      expect(result.current.medications).toEqual(mockMedications)
      expect(result.current.medicationsLoading).toBe(false)
    })
  })

  it('calculates adherence stats correctly', async () => {
    // Mock successful data fetch
    const mockSelect = vi.fn()
      .mockResolvedValueOnce({ data: mockMedications, error: null })
      .mockResolvedValueOnce({ data: mockMedicationLogs, error: null })
    
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    } as any)

    const { result } = renderHook(() => useMedicationService(), { wrapper })

    await waitFor(() => {
      expect(result.current.adherenceStats).toEqual({
        totalMedications: 1,
        takenToday: 0, // No medications taken today in mock data
        adherencePercentage: expect.any(Number),
        currentStreak: expect.any(Number),
        missedThisMonth: expect.any(Number),
      })
    })
  })

  it('handles add medication mutation', async () => {
    const mockInsert = vi.fn().mockResolvedValue({
      data: mockMedications[0],
      error: null,
    })
    
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as any)

    const { result } = renderHook(() => useMedicationService(), { wrapper })

    const newMedication = {
      name: 'New Medication',
      dosage: '50mg',
      frequency: 'Daily',
      time_to_take: '09:00',
    }

    await waitFor(() => {
      result.current.addMedicationMutation.mutate(newMedication)
    })

    expect(mockInsert).toHaveBeenCalledWith([
      {
        ...newMedication,
        user_id: mockUser.id,
      },
    ])
  })
})