import { CreateExpenseDTO, ExpenseDTO } from "@/interfaces/expenses/expense";

export const fetchExpenses = async (apiUrl: string, boatId: number) => {
  try {
    const response = await fetch(`${apiUrl}/expenses/boat/${boatId}/expenses`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.statusText}`);
    }
    const data: ExpenseDTO[] = await response.json();
    return data;
  } catch (err: any) {
    throw new Error(`Failed to fetch expenses: ${err.message}`);
  }
};

export const postExpense = async (apiUrl: string, boatId: number, expense: CreateExpenseDTO) => {
  try {
    const response = await fetch(`${apiUrl}/expenses/${boatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...expense,
        amount: Number(expense.amount),
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add expense: ${response}`);
    }

    const data: ExpenseDTO = await response.json();
    return data;
  } catch (err: any) {
    throw new Error(`Failed to add expense: ${err.message}`);
  }
};

export const deleteExpense = async (apiUrl: string, expenseId: number) => {
  try {
    const response = await fetch(`${apiUrl}/expenses/${expenseId}`, {
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
