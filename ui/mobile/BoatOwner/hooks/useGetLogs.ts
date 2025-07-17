import { useQuery, useQueryClient } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { getLogs } from "@/api/fetch/logs.fetch";
import { useEffect, useState } from "react";
import { getBoatId } from "@/utils/tokenStorage";

function useGetLogs() {
  const [boatId, setBoatId] = useState<number | null>(null);

  useEffect(() => {
    getBoatId().then(setBoatId);
  }, []);

  return useQuery({
    queryKey: [QUERYKEYS.LOGS, boatId],
    queryFn: () => (boatId !== null ? getLogs(boatId) : Promise.resolve([])),
    enabled: boatId !== null,
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetLogs };
