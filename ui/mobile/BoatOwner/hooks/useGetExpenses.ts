import { useQuery } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { fetchExpenses } from "@/api/fetch/expenses.fetch";

function useGetExpenses(boatId: number) {
  return useQuery({
    queryKey: [QUERYKEYS.EXPENSES],
    queryFn: () => fetchExpenses(boatId),
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetExpenses };
