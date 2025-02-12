import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskDTO } from "@/interfaces/todo";
import { postTask } from "@/api/fetch/todo.fetch";
import { QUERYKEYS } from "@/constants/query";

function useAddTask(apiUrl: string, boatId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: CreateTaskDTO) => postTask(apiUrl, boatId, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add task");
    },
  });
}

export { useAddTask };
