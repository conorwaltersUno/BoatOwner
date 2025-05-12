import { useQuery } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { getLogs } from "@/api/fetch/logs.fetch";

function useGetLogs() {
  //get this id from user object when AUTH is implemented
  const boatId = 1;

  return useQuery({
    queryKey: [QUERYKEYS.LOGS],
    queryFn: () => getLogs(boatId),
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetLogs };
