import { CreateExpenseDTO } from "./expense";

export interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newExpense: CreateExpenseDTO) => void;
}
