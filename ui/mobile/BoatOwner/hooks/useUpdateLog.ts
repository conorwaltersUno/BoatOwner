import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { updateLog } from "@/api/fetch/logs.fetch";
import { UpdateLogDTO } from "@/interfaces/log/log";

function useUpdateLog() {
  const queryClient = useQueryClient();
  //get this id from user object when AUTH is implemented
  const boatId = 1;

  return useMutation({
    mutationFn: (updatedLog: UpdateLogDTO) => updateLog(updatedLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.LOGS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add log");
    },
  });
}

export { useUpdateLog };
