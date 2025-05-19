import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { updateLog } from "@/api/fetch/logs.fetch";
import { UpdateLogDTO } from "@/interfaces/log/log";

function useUpdateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedLog: UpdateLogDTO) => updateLog(updatedLog),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.LOGS] });

      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: [QUERYKEYS.LOGS, variables.id] });
      }
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to update log");
    },
  });
}

export { useUpdateLog };
