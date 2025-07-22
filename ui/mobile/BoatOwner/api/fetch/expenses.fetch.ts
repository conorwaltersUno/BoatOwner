import { CreateExpenseDTO, ExpenseDTO, UpdateExpenseDTO } from "@/interfaces/expenses/expense";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";
import { authFetch } from "../../api/fetch/auth.fetch";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV === 'true';
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : apiBaseUrl;

export const fetchExpenses = async (boatId: number) => {
  try {
    const response = await authFetch(`${apiUrl}/expenses/boat/${boatId}/expenses`);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      if (response.status === 404) {
        return [];
      }
      throw new Error(errorBody.message || "Failed to fetch expenses");
    }
    const data: ExpenseDTO[] = await response.json();
    return data;
  } catch (err: any) {
    return []; // Always return an array, never undefined
  }
};

export const postExpense = async (boatId: number, expense: CreateExpenseDTO) => {
  try {
    console.log(`Posting expense for boat ${boatId}:`, expense);
    // Use the correct backend route for creating an expense
    const response = await authFetch(`${apiUrl}/expenses/${boatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...expense,
        amount: Number(expense.amount),
      }),
    });
    console.log(`Response url: ${response.url}`);
    console.log(`Response status: ${response.status}`);
    // Only log the response json if the response is ok
    if (response.ok) {
      const data: ExpenseDTO = await response.json();
      console.log(`Response json:`, data);
      return data;
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Failed to add expense: ${response.statusText}`);
    }
  } catch (err: any) {
    throw new Error(`Failed to add expense: ${err.message}`);
  }
};

export const updateExpense = async (expense: UpdateExpenseDTO) => {
  try {
    const response = await authFetch(`${apiUrl}/expenses/${expense.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: expense.id,
        expense_type: expense.expense_type,
        amount: expense.amount,
        expense_date: expense.expense_date,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update expense: ${response.statusText}`);
    }

    const data: ExpenseDTO = await response.json();
    return data;
  } catch (err: any) {
    throw new Error(`Failed to update expense: ${err.message}`);
  }
};

export const deleteExpense = async (expenseId: number) => {
  try {
    const response = await authFetch(`${apiUrl}/expenses/${expenseId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete expense: ${response.statusText}`);
    }
  } catch (err: any) {
    throw new Error(`Failed to delete expense: ${err.message}`);
  }
};
