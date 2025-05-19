import { useQuery, useQueryClient } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { getLogs } from "@/api/fetch/logs.fetch";
import { useEffect, useState } from "react";
import { getBoatId } from "@/utils/tokenStorage";

function useGetLogs() {
  //get this id from user object when AUTH is implemented
  const [boatId, setBoatId] = useState<number | null>(null);
  const queryClient = useQueryClient();

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
