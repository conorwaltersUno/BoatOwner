export interface ExpenseDTO {
  id: number;
  boat_id: number;
  expense_type: string;
  amount: number;
  expense_date: Date;
  created_on: Date;
}

export interface CreateExpenseDTO {
  boat_id: number;
  expense_type: string;
  amount: number;
  expense_date: Date;
  created_on: Date;
}

export interface UpdateExpenseDTO {
  expense_type: string;
  amount: number;
  expense_date: Date;
  created_on: Date;
}
