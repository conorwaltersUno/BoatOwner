import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { UpdateExpenseDTO } from "../interfaces/expenses/expense";
import { updateExpense } from "@/api/fetch/expenses.fetch";

function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExpense: UpdateExpenseDTO) => updateExpense(newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.EXPENSES] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add expense");
    },
  });
}

export { useUpdateExpense };
