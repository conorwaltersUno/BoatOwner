import { useQuery } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { fetchExpenses } from "@/api/fetch/expenses.fetch";
import { useEffect, useState } from "react";
import { getBoatId } from "@/utils/tokenStorage";

function useGetExpenses() {
  const [boatId, setBoatId] = useState<number | null>(null);

  useEffect(() => {
    getBoatId().then(setBoatId);
  }, []);
  return useQuery({
    queryKey: [QUERYKEYS.EXPENSES, boatId],
    queryFn: () => (boatId !== null ? fetchExpenses(boatId) : Promise.resolve([])),
    enabled: boatId !== null,
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetExpenses };
