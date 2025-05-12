import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskDTO } from "@/interfaces/todo/todo";
import { postTask } from "@/api/fetch/todo.fetch";
import { QUERYKEYS } from "@/constants/query";

function useAddTask() {
  //get this id from user object when AUTH is implemented
  const boatId = 1;

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: CreateTaskDTO) => postTask(boatId, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add task");
    },
  });
}

export { useAddTask };
