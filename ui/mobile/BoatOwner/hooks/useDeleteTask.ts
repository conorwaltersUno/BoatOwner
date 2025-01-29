import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/utils/todo.fetch";
import { QUERYKEYS } from "@/constants/query";

function useDeleteTask(apiUrl: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(apiUrl, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to delete task");
    },
  });
}

export { useDeleteTask };
