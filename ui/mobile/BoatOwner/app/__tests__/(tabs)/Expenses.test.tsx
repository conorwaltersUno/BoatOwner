import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Expenses from "@/app/(tabs)/expenses";

// Mock hooks and components
jest.mock("@/hooks/index", () => ({
  useGetExpenses: jest.fn(),
  useAddExpense: jest.fn(() => ({ mutate: jest.fn() })),
}));
jest.mock("@/components/AddExpenseModal", () => "AddExpenseModal");
jest.mock("@/components/ExpenseTable", () => "ExpenseTable");
jest.mock("@/components/ExpensesPieChart", () => "ExpensesPieChart");

const { useGetExpenses } = require("@/hooks/index");

describe("Expenses Screen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    useGetExpenses.mockReturnValue({ isLoading: true });
    const { getByText } = render(<Expenses />);
    expect(getByText("Loading expenses...")).toBeTruthy();
  });

  it("shows error state", () => {
    useGetExpenses.mockReturnValue({ isError: true, error: { message: "Network error" } });
    const { getByText } = render(<Expenses />);
    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByText("Network error")).toBeTruthy();
    expect(getByText("Retry")).toBeTruthy();
  });

  it("shows empty state", () => {
    useGetExpenses.mockReturnValue({ data: [], isLoading: false, isError: false });
    const { getByText } = render(<Expenses />);
    expect(getByText("No Expenses Yet")).toBeTruthy();
    expect(getByText("+ Add a new expense")).toBeTruthy();
  });

  it("shows main UI with expenses", () => {
    useGetExpenses.mockReturnValue({
      data: [
        { id: 1, type: "Fuel", amount: 50, date: "2024-05-21" },
        { id: 2, type: "Food", amount: 30, date: "2024-05-22" },
      ],
      isLoading: false,
      isError: false,
    });
    const { getByText } = render(<Expenses />);
    expect(getByText("Expenses")).toBeTruthy();
    expect(getByText("Spending Breakdown")).toBeTruthy();
    expect(getByText("Expense Details")).toBeTruthy();
    expect(getByText("+ Add")).toBeTruthy();
  });

  it("opens AddExpenseModal when add button is pressed", async () => {
    useGetExpenses.mockReturnValue({ data: [], isLoading: false, isError: false });
    const { getByText, getByTestId } = render(<Expenses />);
    fireEvent.press(getByText("+ Add a new expense"));
    await waitFor(() => {
      expect(getByTestId("AddExpenseModal")).toBeTruthy();
    });
  });
});
