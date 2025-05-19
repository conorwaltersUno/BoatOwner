import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskDTO } from "@/interfaces/todo/todo";
import { postTask } from "@/api/fetch/todo.fetch";
import { QUERYKEYS } from "@/constants/query";
import { useEffect, useState } from "react";
import { getBoatId } from "@/utils/tokenStorage";

function useAddTask() {
  //get this id from user object when AUTH is implemented
  const [boatId, setBoatId] = useState<number | null>(null);

  useEffect(() => {
    getBoatId().then(setBoatId);
  }, []);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: CreateTaskDTO) => {
      if (!boatId) {
        throw new Error("Boat ID is not available");
      }
      return postTask(boatId, newTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add task");
    },
  });
}

export { useAddTask };
