import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { CreateExpenseDTO, ExpenseDTO } from "@/interfaces/expenses/expense";
import { postExpense } from "@/api/fetch/expenses.fetch";

function useAddExpense() {
  const queryClient = useQueryClient();
  //get this id from user object when AUTH is implemented
  const boatId = 1;

  return useMutation({
    mutationFn: (newExpense: CreateExpenseDTO) => postExpense(boatId, newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.EXPENSES] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add expense");
    },
  });
}

export { useAddExpense };
