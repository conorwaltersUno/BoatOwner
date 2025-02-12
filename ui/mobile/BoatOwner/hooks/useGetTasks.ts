import { useQuery } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { fetchTasks } from "@/api/fetch/todo.fetch";

function useGetTasks(apiUrl: string, boatId: number) {
  return useQuery({
    queryKey: [QUERYKEYS.TASKS],
    queryFn: () => fetchTasks(apiUrl, boatId),
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetTasks };
