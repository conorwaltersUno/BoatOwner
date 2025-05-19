// Example: ui/mobile/BoatOwner/hooks/useGetTasks.ts
import { useQuery } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { fetchTasks } from "@/api/fetch/todo.fetch";
import { getBoatId } from "@/utils/tokenStorage";
import { useEffect, useState } from "react";

function useGetTasks() {
  const [boatId, setBoatId] = useState<number | null>(null);

  useEffect(() => {
    getBoatId().then(setBoatId);
  }, []);

  return useQuery({
    queryKey: [QUERYKEYS.TASKS, boatId],
    queryFn: () => (boatId ? fetchTasks(boatId) : Promise.resolve([])),
    enabled: boatId !== null,
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetTasks };
