import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { CreateExpenseDTO } from "@/interfaces/expenses/expense";
import { postExpense } from "@/api/fetch/expenses.fetch";
import { getBoatId } from "@/utils/tokenStorage";
import { useState, useEffect } from "react";

function useAddExpense() {
  const queryClient = useQueryClient();
  const [boatId, setBoatId] = useState<number | null>(null);

  useEffect(() => {
    getBoatId().then(setBoatId);
  }, []);

  return useMutation({
    mutationFn: async (newExpense: CreateExpenseDTO) => {
      if (boatId === null) throw new Error("Boat ID not found");
      return postExpense(boatId, newExpense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.EXPENSES] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add expense");
    },
  });
}

export { useAddExpense };
