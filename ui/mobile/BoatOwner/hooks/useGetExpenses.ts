import { useQuery } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { fetchExpenses } from "@/api/fetch/expenses.fetch";

function useGetExpenses(apiUrl: string, boatId: number) {
  return useQuery({
    queryKey: [QUERYKEYS.EXPENSES],
    queryFn: () => fetchExpenses(apiUrl, boatId),
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetExpenses };
