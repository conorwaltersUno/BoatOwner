import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/api/fetch/todo.fetch";
import { TaskDTO } from "@/interfaces/todo/todo";
import { QUERYKEYS } from "@/constants/query";

function useUpdateTask(apiUrl: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskDTO) => updateTask(apiUrl, task.id, task.status, task.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to update task");
    },
  });
}

export { useUpdateTask };
