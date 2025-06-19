import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MedicationForm from '@/components/MedicationForm'

describe('MedicationForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByLabelText(/medication name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dosage/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByRole('button', { name: /add medication/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/medication name must be at least 2 characters/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const nameInput = screen.getByLabelText(/medication name/i)
    const dosageInput = screen.getByLabelText(/dosage/i)
    const submitButton = screen.getByRole('button', { name: /add medication/i })

    await user.type(nameInput, 'Aspirin')
    await user.type(dosageInput, '100mg')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Daily',
        time_to_take: '',
      })
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes form when cancel is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('disables form when loading', () => {
    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    )

    const nameInput = screen.getByLabelText(/medication name/i)
    const submitButton = screen.getByRole('button', { name: /adding.../i })

    expect(nameInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})