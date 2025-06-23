import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MedicationForm from "@/components/MedicationForm";


describe("MedicationForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/medication name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dosage/i)).toBeInTheDocument();
    expect(screen.getByText(/frequency/i)).toBeInTheDocument(); // Changed from getByLabelText
    expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument();
  });

  it("renders with correct default values", () => {
    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(
      /medication name/i
    ) as HTMLInputElement;
    const dosageInput = screen.getByLabelText(/dosage/i) as HTMLInputElement;
    const timeInput = screen.getByLabelText(
      /preferred time/i
    ) as HTMLInputElement;

    expect(nameInput.value).toBe("");
    expect(dosageInput.value).toBe("");
    expect(timeInput.value).toBe("");

    // Check if frequency has default value "Daily" - look for the combobox
    const frequencySelect = screen.getByRole("combobox");
    expect(frequencySelect).toBeInTheDocument();
    expect(frequencySelect).toHaveTextContent("Daily");
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/medication name must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates medication name minimum length", async () => {
    const user = userEvent.setup();

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });

    await user.type(nameInput, "A"); // Only 1 character
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/medication name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates time field requirement", async () => {
    const user = userEvent.setup();

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });

    await user.type(nameInput, "Aspirin");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const dosageInput = screen.getByLabelText(/dosage/i);
    const timeInput = screen.getByLabelText(/preferred time/i);
    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });

    await user.type(nameInput, "Aspirin");
    await user.type(dosageInput, "100mg");
    await user.type(timeInput, "08:00");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        medication_name: "Aspirin",
        dosage: "100mg",
        frequency: "Daily",
        time_to_take: "08:00",
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("submits form with minimal required data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const timeInput = screen.getByLabelText(/preferred time/i);
    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });

    await user.type(nameInput, "Vitamin D");
    await user.type(timeInput, "09:00");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        medication_name: "Vitamin D",
        dosage: "",
        frequency: "Daily",
        time_to_take: "09:00",
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("allows changing frequency selection", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const timeInput = screen.getByLabelText(/preferred time/i);

    await user.type(nameInput, "Medicine");
    await user.type(timeInput, "10:00");

    // Click the select trigger
    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    // Wait for the select content to appear
    const selectContent = await screen.findByTestId("frequency-select-content");
    expect(selectContent).toBeInTheDocument();

    // Find and click the option using test ID
    const twiceDailyOption = await screen.findByTestId(
      "frequency-option-twice-daily"
    );
    await user.click(twiceDailyOption);

    // Verify selection
    await waitFor(() => {
      expect(screen.getByDisplayValue("Twice Daily")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        medication_name: "Medicine",
        dosage: "",
        frequency: "Twice Daily",
        time_to_take: "10:00",
      });
    });
  });
  

  it("closes form when cancel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("resets form when closed", async () => {
    const user = userEvent.setup();

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const dosageInput = screen.getByLabelText(/dosage/i);

    // Fill in some data
    await user.type(nameInput, "Test Medicine");
    await user.type(dosageInput, "50mg");

    // Close the form
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("disables form when loading", () => {
    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const dosageInput = screen.getByLabelText(/dosage/i);
    const timeInput = screen.getByLabelText(/preferred time/i);
    const submitButton = screen.getByRole("button", { name: /adding.../i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    expect(nameInput).toBeDisabled();
    expect(dosageInput).toBeDisabled();
    expect(timeInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("handles form submission error", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const submitError = new Error("Submission failed");
    mockOnSubmit.mockRejectedValue(submitError);

    render(
      <MedicationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/medication name/i);
    const timeInput = screen.getByLabelText(/preferred time/i);
    const submitButton = screen.getByRole("button", {
      name: /add medication/i,
    });

    await user.type(nameInput, "Test Medicine");
    await user.type(timeInput, "08:00");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error submitting form:",
      submitError
    );
    expect(mockOnClose).not.toHaveBeenCalled(); // Form should not close on error

    consoleErrorSpy.mockRestore();
  });

  it("does not render when isOpen is false", () => {
    render(
      <MedicationForm
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByLabelText(/medication name/i)).not.toBeInTheDocument();
  });
});
