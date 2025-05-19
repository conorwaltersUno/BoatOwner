import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { SaveLogDTO } from "../interfaces/log/log";
import { postLog } from "@/api/fetch/logs.fetch";
import { getBoatId } from "@/utils/tokenStorage";
import { useState, useEffect } from "react";

function useSaveLog() {
  const queryClient = useQueryClient();
  const [boatId, setBoatId] = useState<number | null>(null);

  useEffect(() => {
    getBoatId().then(setBoatId);
  }, []);

  return useMutation({
    mutationFn: (newLog: SaveLogDTO) => {
      if (boatId === null) throw new Error("Boat ID not found");
      return postLog(newLog, boatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.LOGS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add log");
    },
  });
}

export { useSaveLog };
