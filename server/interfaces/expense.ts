import { Decimal } from "@prisma/client/runtime";

export interface ExpenseDTO {
  id: number;
  boat_id: number;
  expense_type: string;
  amount: Decimal;
  expense_date: Date;
  created_on: Date;
}

export interface CreateExpenseDTO {
  boat_id: number;
  expense_type: string;
  amount: Decimal;
  expense_date: Date;
  created_on: Date;
}

export interface UpdateExpenseDTO {
  id: number;
  expense_type: string;
  amount: Decimal;
  expense_date: Date;
}
