export interface ExpenseDTO {
  id: number;
  boat_id: number;
  expense_type: string;
  amount: number;
  expense_date: string;
  created_on: Date;
}

export interface CreateExpenseDTO {
  expense_type: string;
  amount: number;
  expense_date: Date;
}

export interface UpdateExpenseDTO {
  id: number;
  expense_type: string;
  amount: number;
  expense_date: Date;
}

export interface FormattedExpensesForPieChart {
  value: number;
  color: string;
  text: string;
  textColor: string;
  onPress: () => void;
}
