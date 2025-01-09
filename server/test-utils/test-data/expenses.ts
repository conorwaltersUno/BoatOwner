import { ExpenseDTO } from "../../interfaces/expense";
export const MockExpenseCreate: ExpenseDTO = {
  id: 1,
  boat_id: 1,
  expense_type: "Maintenance",
  amount: 200,
  expense_date: new Date(),
  created_on: new Date(),
};

export const MockExpenseArray: ExpenseDTO[] = [
  {
    id: 1,
    boat_id: 1,
    expense_type: "Maintenance",
    amount: 200,
    expense_date: new Date(),
    created_on: new Date(),
  },
];
